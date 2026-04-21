/**
 * Harness Engine — PDCA 상태 머신
 *
 * 선언적으로 정의된 상태 전이와 가드 조건을 기반으로
 * 피처의 PDCA 라이프사이클을 관리한다.
 */

const fs = require('fs');
const path = require('path');
const audit = require('./audit-logger');
const circuitBreaker = require('./circuit-breaker');
const { resolveProjectRoot } = require('./resolve-project-root');

// ── 상태 정의 ──

const STATES = {
  init: 'init',
  discovery: 'discovery',
  plan: 'plan',
  design: 'design',
  do: 'do',
  check: 'check',
  act: 'act',
  report: 'report',
  archived: 'archived',
  cancelled: 'cancelled',
};

const TERMINAL_STATES = ['archived', 'cancelled'];

// ── 상태 전이 정의 ──

const TRANSITIONS = [
  { from: 'init',      to: 'discovery', guard: 'hasFeatureName' },
  { from: 'discovery', to: 'plan',      guard: 'discoveryComplete' },
  { from: 'init',    to: 'plan',      guard: 'hasFeatureName' },
  { from: 'plan',    to: 'design',    guard: 'planDocumentExists' },
  { from: 'design',  to: 'do',        guard: 'designDocumentApproved' },
  { from: 'do',      to: 'check',     guard: 'implementationExists' },
  { from: 'check',   to: 'act',       guard: 'matchRateBelowThreshold' },
  { from: 'check',   to: 'report',    guard: 'matchRateAboveThreshold' },
  { from: 'act',     to: 'check',     guard: 'iterationNotExceeded' },
  { from: 'act',     to: 'report',    guard: 'maxIterationsReached' },
  { from: 'report',  to: 'archived',  guard: 'reportCompleted' },
  // cancel: 모든 비-터미널 상태에서 취소 가능
  { from: 'discovery', to: 'cancelled', guard: 'userConfirmedCancel' },
  { from: 'plan',    to: 'cancelled', guard: 'userConfirmedCancel' },
  { from: 'design',  to: 'cancelled', guard: 'userConfirmedCancel' },
  { from: 'do',      to: 'cancelled', guard: 'userConfirmedCancel' },
  { from: 'check',   to: 'cancelled', guard: 'userConfirmedCancel' },
  { from: 'act',     to: 'cancelled', guard: 'userConfirmedCancel' },
  { from: 'report',  to: 'cancelled', guard: 'userConfirmedCancel' },
];

// ── 상태 파일 경로 ──

function getHarnessPath(projectRoot) {
  const root = projectRoot || resolveProjectRoot();
  return path.join(root, '.harness', 'state', 'harness.json');
}

function getFeatureStatePath(projectRoot, featureName) {
  const root = projectRoot || resolveProjectRoot();
  return path.join(root, '.harness', 'state', 'features', `${featureName}.state.json`);
}

function getEpicStatePath(projectRoot, epicName) {
  const root = projectRoot || resolveProjectRoot();
  return path.join(root, '.harness', 'state', 'epics', `${epicName}.state.json`);
}

// ── 상태 읽기/쓰기 ──

function readHarnessState(projectRoot) {
  const filePath = getHarnessPath(projectRoot);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeHarnessState(projectRoot, state) {
  if (typeof projectRoot !== 'string') {
    throw new TypeError(
      `writeHarnessState: 첫 번째 인자 projectRoot는 string이어야 합니다. ` +
      `받은 타입: ${typeof projectRoot}. ` +
      `올바른 사용법: sm.writeHarnessState(process.cwd(), { ... })`
    );
  }
  const filePath = getHarnessPath(projectRoot);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(state, null, 2), 'utf-8');
}

function readFeatureState(projectRoot, featureName) {
  const filePath = getFeatureStatePath(projectRoot, featureName);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeFeatureState(projectRoot, featureName, state) {
  const filePath = getFeatureStatePath(projectRoot, featureName);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(state, null, 2), 'utf-8');
}

// ── 상태 머신 API ──

/**
 * 새 피처의 초기 상태를 생성한다.
 */
function createFeature(projectRoot, featureName, epicName) {
  if (typeof projectRoot !== 'string') {
    throw new TypeError(
      `createFeature: projectRoot는 string이어야 합니다. 받은 타입: ${typeof projectRoot}`
    );
  }
  const now = new Date().toISOString();
  const featureState = {
    feature: featureName,
    epic: epicName || null,
    phase: 'init',
    history: [],
    checkpoints: [],
    matchRate: null,
    iterationCount: 0,
    evaluatorResults: [],
    createdAt: now,
    updatedAt: now,
  };

  writeFeatureState(projectRoot, featureName, featureState);

  // harness.json에도 등록
  const harness = readHarnessState(projectRoot);
  if (harness) {
    if (!harness.features) harness.features = {};
    harness.activeFeature = featureName;
    harness.features[featureName] = {
      phase: 'init',
      epic: epicName || null,
      matchRate: null,
      iterationCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    writeHarnessState(projectRoot, harness);
  }

  // 감사 로그 기록
  audit.log(projectRoot, {
    event: 'feature_created',
    feature: featureName,
    data: { phase: 'init', profile: epicName || null },
    session: null,
  });

  return featureState;
}

// ── Epic API ──

/**
 * Epic 상태를 읽는다.
 */
function readEpicState(projectRoot, epicName) {
  const filePath = getEpicStatePath(projectRoot, epicName);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

/**
 * Epic 상태를 저장한다.
 */
function writeEpicState(projectRoot, epicName, state) {
  const filePath = getEpicStatePath(projectRoot, epicName);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(state, null, 2), 'utf-8');
}

/**
 * 새 Epic을 생성한다.
 * Epic은 단순 컨테이너로, 자체 state machine이 없다.
 * 모든 Feature가 완료되면 Epic도 완료된다.
 */
function createEpic(projectRoot, epicName, features) {
  const now = new Date().toISOString();
  const epicState = {
    epic: epicName,
    features: features.map((f, i) => ({
      name: f.name,
      order: i + 1,
      depends: f.depends || [],
      status: 'pending',
    })),
    status: 'in_progress',
    createdAt: now,
    updatedAt: now,
  };

  writeEpicState(projectRoot, epicName, epicState);

  // harness.json에 Epic 및 소속 Feature 등록
  const harness = readHarnessState(projectRoot);
  if (harness) {
    if (!harness.epics) harness.epics = {};
    harness.epics[epicName] = {
      status: 'in_progress',
      featureCount: features.length,
      createdAt: now,
      updatedAt: now,
    };
    if (!harness.features) harness.features = {};
    for (const f of epicState.features) {
      harness.features[f.name] = {
        phase: 'init',
        epic: epicName,
        matchRate: null,
        iterationCount: 0,
        createdAt: now,
        updatedAt: now,
      };
    }
    harness.activeEpic = epicName;
    writeHarnessState(projectRoot, harness);
  }

  return epicState;
}

/**
 * Epic의 Feature 상태를 동기화한다.
 * Feature가 완료(archived)되면 Epic에 반영하고,
 * 모든 Feature가 완료되면 Epic status를 'completed'로 변경한다.
 */
function syncEpicStatus(projectRoot, epicName) {
  const epicState = readEpicState(projectRoot, epicName);
  if (!epicState) return null;

  let allCompleted = true;
  for (const f of epicState.features) {
    const featureState = readFeatureState(projectRoot, f.name);
    if (featureState) {
      f.status = featureState.phase === 'archived' ? 'completed'
        : featureState.phase === 'cancelled' ? 'cancelled'
        : 'in_progress';
    }
    if (f.status !== 'completed' && f.status !== 'cancelled') {
      allCompleted = false;
    }
  }

  if (allCompleted) {
    epicState.status = 'completed';
  }
  epicState.updatedAt = new Date().toISOString();
  writeEpicState(projectRoot, epicName, epicState);
  return epicState;
}

/**
 * Epic에서 다음으로 진행할 Feature를 반환한다.
 * 의존성이 충족된(의존하는 Feature가 모두 completed) 중 가장 앞 순서.
 */
function getNextEpicFeature(projectRoot, epicName) {
  const epicState = readEpicState(projectRoot, epicName);
  if (!epicState) return null;

  const satisfiedNames = epicState.features
    .filter((f) => f.status === 'completed' || f.status === 'cancelled')
    .map((f) => f.name);

  for (const f of epicState.features) {
    if (f.status !== 'pending') continue;
    const depsOk = f.depends.every((d) => satisfiedNames.includes(d));
    if (depsOk) return f.name;
  }
  return null;
}

/**
 * 현재 상태에서 가능한 전이 목록을 반환한다.
 */
function getAvailableTransitions(currentPhase) {
  return TRANSITIONS.filter((t) => t.from === currentPhase);
}

/**
 * 특정 전이가 가능한지 확인한다 (가드 조건 미평가, 구조적 가능성만).
 */
function canTransition(currentPhase, targetPhase) {
  return TRANSITIONS.some((t) => t.from === currentPhase && t.to === targetPhase);
}

/**
 * 상태 전이를 실행한다.
 * 가드 조건은 호출자가 사전에 검증해야 한다.
 */
function transition(projectRoot, featureName, targetPhase, metadata, options) {
  const featureState = readFeatureState(projectRoot, featureName);
  if (!featureState) {
    throw new Error(`Feature "${featureName}" not found`);
  }

  const currentPhase = featureState.phase;

  if (!canTransition(currentPhase, targetPhase)) {
    throw new Error(
      `Cannot transition from "${currentPhase}" to "${targetPhase}". ` +
      `Available: ${getAvailableTransitions(currentPhase).map((t) => t.to).join(', ')}`
    );
  }

  if (currentPhase === 'act' && targetPhase === 'check') {
    if (circuitBreaker.isOpen(projectRoot)) {
      throw new Error('Circuit breaker is open: too many failed iterations');
    }
  }

  const now = new Date().toISOString();
  const opts = options || {};
  const automationLevel = opts.automationLevel !== undefined ? opts.automationLevel : null;

  featureState.history.push({
    from: currentPhase,
    to: targetPhase,
    timestamp: now,
    metadata: metadata || {},
    automationLevel,
  });

  featureState.phase = targetPhase;
  featureState.updatedAt = now;

  if (targetPhase === 'act') {
    featureState.iterationCount += 1;
  }

  writeFeatureState(projectRoot, featureName, featureState);

  const harness = readHarnessState(projectRoot);
  if (harness) {
    if (!harness.features) harness.features = {};
    if (!harness.features[featureName]) {
      harness.features[featureName] = {
        phase: featureState.phase,
        epic: featureState.epic,
        matchRate: featureState.matchRate,
        iterationCount: featureState.iterationCount,
        createdAt: featureState.createdAt,
        updatedAt: featureState.updatedAt,
      };
    } else {
      harness.features[featureName].phase = targetPhase;
      harness.features[featureName].matchRate = featureState.matchRate;
      harness.features[featureName].iterationCount = featureState.iterationCount;
      harness.features[featureName].updatedAt = now;
    }
    harness.activeFeature = featureName;
    writeHarnessState(projectRoot, harness);
  }

  audit.log(projectRoot, {
    event: 'state_transition',
    feature: featureName,
    data: { from: currentPhase, to: targetPhase, automationLevel },
    session: opts.sessionId || null,
  });

  if (targetPhase === 'cancelled') {
    audit.log(projectRoot, {
      event: 'feature_cancelled',
      feature: featureName,
      data: { from: currentPhase },
      session: opts.sessionId || null,
    });
  }

  return featureState;
}

/**
 * archive 후 harness.json의 feature 항목을 경량 요약으로 축소한다.
 */
function summarizeArchivedFeature(projectRoot, featureName, archivedTo) {
  const harness = readHarnessState(projectRoot);
  if (!harness || !harness.features || !harness.features[featureName]) return;

  const feat = harness.features[featureName];
  harness.features[featureName] = {
    phase: 'archived',
    matchRate: feat.matchRate || null,
    iterationCount: feat.iterationCount || 0,
    createdAt: feat.createdAt,
    archivedAt: new Date().toISOString(),
    archivedTo: archivedTo || null,
  };

  if (harness.activeFeature === featureName) {
    harness.activeFeature = null;
  }
  writeHarnessState(projectRoot, harness);
}

/**
 * 현재 상태를 조회한다.
 */
function getCurrentState(projectRoot, featureName) {
  return readFeatureState(projectRoot, featureName);
}

/**
 * 다음으로 갈 수 있는 상태 목록을 반환한다.
 */
function getNextStates(projectRoot, featureName) {
  const state = readFeatureState(projectRoot, featureName);
  if (!state) return [];
  return getAvailableTransitions(state.phase).map((t) => ({
    target: t.to,
    guard: t.guard,
  }));
}

/**
 * 피처의 전체 상태 전이 이력을 반환한다.
 */
function getHistory(projectRoot, featureName) {
  const state = readFeatureState(projectRoot, featureName);
  if (!state) return [];
  return state.history;
}

/**
 * 상태가 터미널(종료) 상태인지 확인한다.
 */
function isTerminal(phase) {
  return TERMINAL_STATES.includes(phase);
}

module.exports = {
  STATES,
  TRANSITIONS,
  TERMINAL_STATES,
  createFeature,
  transition,
  canTransition,
  getCurrentState,
  getNextStates,
  getAvailableTransitions,
  getHistory,
  isTerminal,
  summarizeArchivedFeature,
  readHarnessState,
  writeHarnessState,
  readFeatureState,
  writeFeatureState,
  getHarnessPath,
  getFeatureStatePath,
  // Epic API
  getEpicStatePath,
  readEpicState,
  writeEpicState,
  createEpic,
  syncEpicStatus,
  getNextEpicFeature,
};

// ── CLI 진입점 ──
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const projectRoot = process.cwd();

  try {
    if (command === 'transition') {
      const [, featureName, targetPhase] = args;
      if (!featureName || !targetPhase) {
        process.stderr.write('Usage: node state-machine.js transition <featureName> <targetPhase>\n');
        process.exit(1);
      }
      const result = transition(projectRoot, featureName, targetPhase);
      process.stdout.write(JSON.stringify(result, null, 2) + '\n');

    } else if (command === 'create') {
      const [, featureName, epicName] = args;
      if (!featureName) {
        process.stderr.write('Usage: node state-machine.js create <featureName> [epicName]\n');
        process.exit(1);
      }
      const result = createFeature(projectRoot, featureName, epicName || null);
      process.stdout.write(JSON.stringify(result, null, 2) + '\n');

    } else if (command === 'status') {
      const [, featureName] = args;
      if (!featureName) {
        process.stderr.write('Usage: node state-machine.js status <featureName>\n');
        process.exit(1);
      }
      const state = getCurrentState(projectRoot, featureName);
      if (!state) {
        process.stderr.write('Feature "' + featureName + '" not found\n');
        process.exit(1);
      }
      process.stdout.write(JSON.stringify(state, null, 2) + '\n');

    } else {
      process.stderr.write('Commands: transition, create, status\n');
      process.exit(1);
    }
  } catch (err) {
    process.stderr.write('Error: ' + err.message + '\n');
    process.exit(1);
  }
}
