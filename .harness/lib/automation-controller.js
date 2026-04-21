/**
 * Harness Engine — Automation Controller
 *
 * 5-Level 자동화 레벨을 관리하고, 액션별 게이트/자동승인/거부를 결정한다.
 * Phase Transition Gate와 Destructive Operation Gate를 제공한다.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { migrate } = require('./config-migrator');

// ── 5-Level 상수 ──

const LEVELS = {
  MANUAL: 0,
  GUIDED: 1,
  SEMI_AUTO: 2,
  AUTO: 3,
  FULL_AUTO: 4,
};

// ── Phase Transition Gate ──
// from→to : 자동 승인에 필요한 최소 레벨
const PHASE_GATES = {
  'init→discovery': 1,
  'init→plan': 1,
  'discovery→plan': 1,
  'plan→design': 2,
  'design→do': 2,
  'do→check': 3,
  'check→act': 2,
  'check→report': 3,
  'act→check': 2,
  'act→report': 3,
  'report→archived': 3,
  // *→cancelled: L0 (모든 레벨에서 취소 가능 = 자동 승인)
  'discovery→cancelled': 0,
  'plan→cancelled': 0,
  'design→cancelled': 0,
  'do→cancelled': 0,
  'check→cancelled': 0,
  'act→cancelled': 0,
  'report→cancelled': 0,
};

// ── Destructive Operation Gate ──
// autoLevel: 자동 승인에 필요한 최소 레벨
// denyBelow: 이 레벨 미만이면 deny (null = deny 없음)
// alwaysDeny: true면 모든 레벨에서 deny
const DESTRUCTIVE_GATES = {
  file_delete: { autoLevel: 4, denyBelow: 0 },
  bash_dangerous: { autoLevel: 3, denyBelow: 2 },
  git_push_force: { alwaysDeny: true },
  config_change: { autoLevel: 4, denyBelow: 2 },
};

// ── Config 로더 ──

/**
 * .harness/config.json을 로드하여 automation 섹션을 반환한다.
 * 진입 시 config-migrator.migrate()를 멱등하게 호출한다.
 *
 * @param {string} projectRoot - 프로젝트 루트 경로
 * @returns {object} automation 설정
 */
function loadConfig(projectRoot) {
  migrate(projectRoot);

  const configPath = path.join(projectRoot, '.harness', 'config.json');
  if (!fs.existsSync(configPath)) {
    // config 파일이 없으면 기본값 반환
    return { defaultLevel: 2 };
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  return config.automation || { defaultLevel: 2 };
}

/**
 * config.json을 통째로 읽는다.
 */
function readFullConfig(projectRoot) {
  const configPath = path.join(projectRoot, '.harness', 'config.json');
  if (!fs.existsSync(configPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

/**
 * config.json을 저장한다.
 */
function writeFullConfig(projectRoot, config) {
  const configPath = path.join(projectRoot, '.harness', 'config.json');
  const dir = path.dirname(configPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

// ── API ──

/**
 * 액션에 대해 'auto' | 'gate' | 'deny' 를 결정한다.
 *
 * @param {string} actionId - 액션 식별자 (phase transition: "from→to", destructive: "file_delete" 등)
 * @param {object} context - { from, to, currentLevel }
 * @returns {'auto'|'gate'|'deny'}
 */
function resolveAction(actionId, context) {
  const { currentLevel } = context;

  // 1. Destructive Operation Gate (guardrail deny 우선)
  const destructive = DESTRUCTIVE_GATES[actionId];
  if (destructive) {
    if (destructive.alwaysDeny) return 'deny';
    if (currentLevel < destructive.denyBelow) return 'deny';
    if (currentLevel >= destructive.autoLevel) return 'auto';
    return 'gate';
  }

  // 2. Phase Transition Gate
  const phaseKey = `${context.from}→${context.to}`;
  const requiredLevel = PHASE_GATES[phaseKey];
  if (requiredLevel !== undefined) {
    return currentLevel >= requiredLevel ? 'auto' : 'gate';
  }

  // 3. 폴백: 정의되지 않은 전환
  return 'gate';
}

/**
 * 현재 프로젝트의 automation level을 조회한다.
 *
 * @param {string} projectRoot - 프로젝트 루트 경로
 * @returns {number} 현재 레벨 (0~4)
 */
function getLevel(projectRoot) {
  const automation = loadConfig(projectRoot);
  return automation.defaultLevel;
}

/**
 * 프로젝트의 automation level을 설정한다.
 *
 * @param {string} projectRoot - 프로젝트 루트 경로
 * @param {number} level - 설정할 레벨 (0~4)
 */
function setLevel(projectRoot, level) {
  if (!Number.isInteger(level) || level < 0 || level > 4) {
    throw new Error(`Invalid automation level: ${level}. Must be 0-4.`);
  }

  migrate(projectRoot);

  const config = readFullConfig(projectRoot);
  if (!config) {
    throw new Error('config.json not found. Run /harness:init first.');
  }

  if (!config.automation) {
    config.automation = { defaultLevel: level };
  } else {
    config.automation.defaultLevel = level;
  }

  writeFullConfig(projectRoot, config);
}

/**
 * 긴급 정지: 레벨을 L1로 강제 다운, emergencyStop 플래그를 설정한다.
 *
 * @param {string} projectRoot - 프로젝트 루트 경로
 */
function emergencyStop(projectRoot) {
  migrate(projectRoot);

  const config = readFullConfig(projectRoot);
  if (!config) {
    throw new Error('config.json not found. Run /harness:init first.');
  }

  if (!config.automation) {
    config.automation = { defaultLevel: 1 };
  } else {
    config.automation.defaultLevel = 1;
  }
  config.automation.emergencyStop = true;

  writeFullConfig(projectRoot, config);
}

/**
 * 긴급 정지 해제: emergencyStop 플래그를 제거하고 L2로 복구한다.
 *
 * @param {string} projectRoot - 프로젝트 루트 경로
 */
function emergencyResume(projectRoot) {
  migrate(projectRoot);

  const config = readFullConfig(projectRoot);
  if (!config) {
    throw new Error('config.json not found. Run /harness:init first.');
  }

  if (!config.automation) {
    config.automation = { defaultLevel: 2 };
  } else {
    config.automation.defaultLevel = 2;
  }
  delete config.automation.emergencyStop;

  writeFullConfig(projectRoot, config);
}

module.exports = {
  LEVELS,
  resolveAction,
  emergencyStop,
  emergencyResume,
  getLevel,
  setLevel,
  loadConfig,
};
