/**
 * Harness Engine — Destructive Command Detector
 *
 * 8개 guardrail rule을 통해 위험한 명령어/입력을 감지한다.
 * 복수 매칭 시 severity가 가장 높은 rule을 반환한다.
 *
 * 공개 API: detect(toolName, input) → { ruleId, severity, action } | null
 */

'use strict';

const path = require('path');
const { resolveProjectRoot } = require('../resolve-project-root');

const SEVERITY_ORDER = { critical: 3, high: 2, medium: 1, low: 0 };
const PROTECTED_DIRS = new Set(['.git', '.harness', 'node_modules']);

/**
 * 복합 명령어(&&, ;, ||)에서 rm 서브커맨드의 타겟 경로 토큰을 추출한다.
 * 플래그(-rf, --force 등)는 제거하고 경로 토큰만 반환한다.
 *
 * @param {string} cmd - 전체 명령어 문자열
 * @returns {string[]} rm 타겟 경로 배열
 */
function extractRmTargets(cmd) {
  const targets = [];
  // &&, ;, || 로 구분하여 서브커맨드 분리 (파이프 | 는 stdin/stdout 연결이므로 제외)
  const parts = cmd.split(/&&|;|\|\|/);
  for (const part of parts) {
    const trimmed = part.trim();
    if (!/^\s*rm\b/.test(trimmed)) continue;
    // 'rm' 이후 토큰들 중 플래그(-로 시작)가 아닌 것을 경로로 간주
    const tokens = trimmed.split(/\s+/).slice(1); // 'rm' 제거
    for (const token of tokens) {
      if (!token.startsWith('-')) {
        targets.push(token);
      }
    }
  }
  return targets;
}

/**
 * 경로가 프로젝트 루트 하위이고 보호 디렉토리가 아닌지 확인한다.
 *
 * @param {string} target - rm 타겟 경로
 * @param {string} cwd - 현재 작업 디렉토리
 * @param {string} projectRoot - resolveProjectRoot(cwd) 결과 (호출자가 캐싱하여 전달)
 * @returns {boolean} 허용 가능하면 true
 */
function isWithinProjectRoot(target, cwd, projectRoot) {
  try {
    const abs = path.resolve(cwd, target);
    // 프로젝트 루트 하위가 아니면 false
    if (!abs.startsWith(projectRoot + path.sep) && abs !== projectRoot) return false;
    // 보호 경로 포함 시 false
    const rel = path.relative(projectRoot, abs);
    const firstSegment = rel.split(path.sep)[0];
    if (PROTECTED_DIRS.has(firstSegment)) return false;
    // .env 파일 패턴 보호
    if (/^\.env(\.|$)/.test(path.basename(abs))) return false;
    return true;
  } catch {
    return false;
  }
}

const rules = [
  {
    ruleId: 'G-001',
    description: 'rm -rf pattern',
    severity: 'critical',
    action: 'deny',
    test(toolName, input) {
      if (!input) return false;
      // 패턴 매치 없으면 통과
      if (!/\brm\s+.*-\w*r\w*f|rm\s+.*-\w*f\w*r|\brm\s+-rf\b/.test(input)) return false;
      // 매치됐어도 모든 rm 타겟이 프로젝트 루트 하위이면 허용
      const targets = extractRmTargets(input);
      if (targets.length > 0) {
        const cwd = process.cwd();
        const projectRoot = resolveProjectRoot(cwd);
        const allSafe = targets.every((t) => isWithinProjectRoot(t, cwd, projectRoot));
        if (allSafe) return false;
      }
      return true;
    },
  },
  {
    ruleId: 'G-002',
    description: 'git push --force / git push -f',
    severity: 'critical',
    action: 'deny',
    test(toolName, input) {
      if (!input) return false;
      return /\bgit\s+push\s+.*--force\b|\bgit\s+push\s+.*-f\b/.test(input);
    },
  },
  {
    ruleId: 'G-003',
    description: 'git reset --hard',
    severity: 'high',
    action: 'ask',
    test(toolName, input) {
      if (!input) return false;
      return /\bgit\s+reset\s+--hard\b/.test(input);
    },
  },
  {
    ruleId: 'G-004',
    description: 'protected branch modification',
    severity: 'high',
    action: 'ask',
    test(toolName, input) {
      if (!input) return false;
      return /\bgit\s+push\s+.*\b(main|master|release)\b/.test(input);
    },
  },
  {
    ruleId: 'G-005',
    description: '.env file modification',
    severity: 'high',
    action: 'ask',
    test(toolName, input) {
      if (!input) return false;
      return /\.env\b/.test(input);
    },
  },
  {
    ruleId: 'G-006',
    description: 'secret key access pattern',
    severity: 'high',
    action: 'ask',
    test(toolName, input) {
      if (!input) return false;
      return /\bAWS_SECRET\b|\bPRIVATE_KEY\b|password\s*=/i.test(input);
    },
  },
  {
    ruleId: 'G-007',
    description: 'bulk file deletion (10+ rm)',
    severity: 'medium',
    action: 'ask',
    test(toolName, input) {
      if (!input) return false;
      const rmMatches = input.match(/\brm\s+/g);
      return rmMatches !== null && rmMatches.length >= 10;
    },
  },
  {
    ruleId: 'G-008',
    description: 'root directory operation',
    severity: 'critical',
    action: 'deny',
    test(toolName, input) {
      if (!input) return false;
      // Matches operations targeting root: "rm /", "cd /", "mv / ", etc.
      // But not paths like /home, /usr — only bare / or / followed by space/end
      return /\b(?:rm|mv|cp|chmod|chown|cd|ls)\s+(?:.*\s)?\/(?:\s|$)/.test(input) ||
             /\brm\s+.*-\w*r\w*\s+\/(?:\s|$)/.test(input);
    },
  },
  {
    ruleId: 'G-009',
    description: 'dd disk write (potential disk wipe)',
    severity: 'critical',
    action: 'deny',
    test(toolName, input) {
      if (!input) return false;
      // dd of=/dev/... 패턴: 디스크 직접 쓰기
      return /\bdd\b.*\bof=\/dev\//.test(input);
    },
  },
];

/**
 * 입력에서 위험한 패턴을 감지한다.
 *
 * @param {string} toolName - 도구 이름 (예: 'Bash', 'Write')
 * @param {string} input - 명령어 또는 입력 텍스트
 * @returns {{ ruleId: string, severity: string, action: 'deny'|'ask'|'allow' } | null}
 */
function detect(toolName, input) {
  if (input == null || typeof input !== 'string' || input.trim() === '') {
    return null;
  }

  let highest = null;

  for (const rule of rules) {
    if (rule.test(toolName, input)) {
      if (!highest || SEVERITY_ORDER[rule.severity] > SEVERITY_ORDER[highest.severity]) {
        highest = { ruleId: rule.ruleId, severity: rule.severity, action: rule.action };
      }
    }
  }

  return highest;
}

module.exports = { detect };
