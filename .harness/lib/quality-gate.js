/**
 * Harness Engine — 품질 게이트
 *
 * Evaluator 에이전트가 실행하는 검증 관점(perspective)을 선언적으로 정의.
 * 프로젝트별 관점 추가/제거 가능.
 */

const DEFAULT_PERSPECTIVES = [
  {
    id: 'build',
    name: 'Build Check',
    description: '프로젝트가 빌드 에러 없이 컴파일되는지 확인',
    severity: 'critical',
    automated: true,
    command: null,
  },
  {
    id: 'type',
    name: 'Type Safety',
    description: '타입 에러가 없는지 확인',
    severity: 'critical',
    automated: true,
    command: null,
  },
  {
    id: 'lint',
    name: 'Linter Compliance',
    description: 'ESLint 규칙 위반이 없는지 확인',
    severity: 'critical',
    automated: true,
    command: null,
  },
  {
    id: 'convention',
    name: 'Convention Adherence',
    description: '.claude/rules/ 규칙을 준수하는지 검증',
    severity: 'high',
    automated: false,
    rubric: [
      'File naming follows convention pattern',
      'Import order matches convention',
      'Architecture layer boundaries respected',
      'No forbidden patterns detected',
    ],
  },
  {
    id: 'design_match',
    name: 'Design-Implementation Match',
    description: 'Design 문서의 명세와 실제 구현이 일치하는지 검증',
    severity: 'high',
    automated: false,
    rubric: [
      'All components from design are implemented',
      'API contracts match design specification',
      'Data flow matches design diagrams',
      'Error handling covers design-specified cases',
    ],
  },
  {
    id: 'ds_match',
    name: 'Design System Match',
    description: '공유 DS 패키지의 토큰/컴포넌트를 사용하는지 검증',
    severity: 'medium',
    automated: false,
    rubric: [
      'Colors use DS tokens, not hex/rgb literals',
      'Typography uses DS scale, not arbitrary values',
      'Spacing uses DS scale tokens',
      'DS primitive components imported (no re-implementation)',
      'DS composition patterns used where available',
      'Theme overrides are in theme.config.ts only, not scattered in code',
    ],
  },
  {
    id: 'functional',
    name: 'Functional Verification',
    description: 'Design 문서의 검증 기준(Acceptance Criteria)이 충족되는지 검증',
    severity: 'critical',
    automated: 'partial',
    rubric: [
      'API endpoints respond with expected status codes and data shapes',
      'UI components render without runtime errors',
      'Acceptance Criteria from Design section 5 are met',
      'Edge cases from Design section 5.3 are handled',
    ],
  },
  {
    id: 'scope_drift',
    name: 'Scope Drift Detection',
    description: 'Design 문서에 명시되지 않은 파일 변경이 있는지 검증',
    severity: 'high',
    automated: false,
    rubric: [
      'All modified files are listed in Design document',
      'No unexpected file additions outside stated scope',
      'No unrelated refactoring mixed into feature changes',
    ],
  },
];

/**
 * Frontend 파일 패턴 — 이 패턴에 해당하는 변경 파일이 있으면 frontend 작업으로 판단한다.
 */
const FRONTEND_FILE_PATTERNS = [
  /\.(tsx|jsx)$/,
  /\/(components|pages|app|views|screens|hooks|layouts)\/.*\.ts$/,
];

const FRONTEND_BEST_PRACTICES_PERSPECTIVE = {
  id: 'frontend_best_practices',
  name: 'Frontend Best Practices',
  description: 'Vercel React 성능 최적화 가이드라인 준수 여부 검증 (CRITICAL/HIGH 우선순위 규칙)',
  severity: 'high',
  automated: false,
  frontend_only: true,
  skill_ref: '~/.claude/skills/vercel-react-best-practices/SKILL.md',
  rubric: [
    // CRITICAL: Waterfalls
    'Independent async operations use Promise.all(), not sequential awaits',
    'Suspense boundaries used to stream content where appropriate',
    // CRITICAL: Bundle size
    'No barrel file imports (import directly from source, not index files)',
    'Heavy/conditional components use dynamic imports',
    // HIGH: Server-side (Next.js)
    'React.cache() used for per-request deduplication in RSC',
    'Minimal data serialized and passed to client components',
    // MEDIUM: Re-renders
    'No state subscribed only in callbacks (use refs instead)',
    'Expensive computations wrapped in useMemo/memo',
    'Non-primitive default props hoisted outside component',
    // Rendering
    'Conditional rendering uses ternary, not && with non-boolean',
    'Static JSX extracted outside component body where possible',
  ],
};

/**
 * 평가 결과 객체를 생성한다.
 */
function createEvaluationResult(perspectiveId, pass, details, issues, severity) {
  return {
    id: perspectiveId,
    pass: pass,
    details: details || '',
    issues: issues || [],
    severity: severity || null,
    evaluatedAt: new Date().toISOString(),
  };
}

/**
 * 전체 matchRate를 계산한다.
 *
 * @param {object[]} results - 평가 결과 배열
 * @returns {number} 0-100 백분율
 */
function calculateMatchRate(results) {
  if (results.length === 0) return 0;
  const passed = results.filter((r) => r.pass).length;
  return Math.round((passed / results.length) * 100);
}

/**
 * 변경 파일 목록에 frontend 파일이 포함되어 있는지 확인한다.
 *
 * @param {string[]} changedFiles - 변경된 파일 경로 목록
 * @returns {boolean}
 */
function hasFrontendChanges(changedFiles) {
  if (!changedFiles || changedFiles.length === 0) return false;
  return changedFiles.some((f) => FRONTEND_FILE_PATTERNS.some((pattern) => pattern.test(f)));
}

/**
 * 프로필 기반으로 관점 목록을 구성한다.
 * automated 관점의 command를 프로필의 commands로 채운다.
 *
 * @param {object} profile - 프로필 객체
 * @param {object} [config] - 하네스 config
 * @param {string[]} [changedFiles] - 변경된 파일 경로 목록 (frontend 감지용)
 * @returns {object[]} 활성 관점 목록
 */
function buildPerspectives(profile, config, changedFiles) {
  const perspectives = JSON.parse(JSON.stringify(DEFAULT_PERSPECTIVES));
  const commands = profile.commands || {};

  for (const p of perspectives) {
    if (p.automated === true && commands[p.id]) {
      p.command = commands[p.id];
    } else if (p.id === 'build' && commands.build) {
      p.command = commands.build;
    } else if (p.id === 'type' && commands.typecheck) {
      p.command = commands.typecheck;
    } else if (p.id === 'lint' && commands.lint) {
      p.command = commands.lint;
    } else if (p.id === 'functional' && commands.dev) {
      p.command = commands.dev;
    }
  }

  // DS가 없으면 ds_match 제외
  if (!profile.designSystem) {
    const idx = perspectives.findIndex((p) => p.id === 'ds_match');
    if (idx >= 0) perspectives.splice(idx, 1);
  }

  // frontend 스택이 있고 frontend 파일이 변경된 경우에만 frontend_best_practices 추가
  if (profile.stack && profile.stack.frontend && hasFrontendChanges(changedFiles)) {
    perspectives.push(JSON.parse(JSON.stringify(FRONTEND_BEST_PRACTICES_PERSPECTIVE)));
  }

  return perspectives;
}

/**
 * 커스텀 관점을 추가한다.
 */
function addPerspective(perspectives, perspective) {
  const result = perspectives.filter((p) => p.id !== perspective.id);
  result.push(perspective);
  return result;
}

/**
 * 관점을 제거한다.
 */
function removePerspective(perspectives, perspectiveId) {
  return perspectives.filter((p) => p.id !== perspectiveId);
}

/**
 * 평가 결과 요약을 생성한다.
 */
function summarizeResults(results) {
  const matchRate = calculateMatchRate(results);
  const critical = results.filter((r) => !r.pass && r.severity === 'critical');
  const high = results.filter((r) => !r.pass && r.severity === 'high');
  const passed = results.filter((r) => r.pass);

  return {
    matchRate,
    total: results.length,
    passed: passed.length,
    failed: results.length - passed.length,
    criticalIssues: critical.length,
    highIssues: high.length,
    allIssues: results.flatMap((r) => r.issues || []),
  };
}

module.exports = {
  DEFAULT_PERSPECTIVES,
  FRONTEND_BEST_PRACTICES_PERSPECTIVE,
  createEvaluationResult,
  calculateMatchRate,
  buildPerspectives,
  hasFrontendChanges,
  addPerspective,
  removePerspective,
  summarizeResults,
};
