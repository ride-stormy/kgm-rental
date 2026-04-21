/**
 * Harness Engine — Trust Engine
 *
 * 6개 컴포넌트 가중 평균으로 신뢰 점수(0-100)를 산출하고,
 * 이벤트 기반 점수 변동, 에스컬레이션/다운그레이드 판정을 수행한다.
 */

const fs = require('fs');
const path = require('path');

// ── 컴포넌트 가중치 ──

const WEIGHTS = {
  pdcaCompletionRate: 0.25,
  gatePassRate: 0.20,
  rollbackFrequency: 0.15,
  destructiveBlockRate: 0.15,
  iterationEfficiency: 0.15,
  userOverrideRate: 0.10,
};

// ── 레벨 임계치 ──

const LEVEL_THRESHOLDS = [
  { level: 'L4', min: 85 },
  { level: 'L3', min: 65 },
  { level: 'L2', min: 40 },
  { level: 'L1', min: 20 },
  { level: 'L0', min: 0 },
];

// ── 이벤트별 점수 변동 ──

const EVENT_DELTAS = {
  consecutive_10_success: 5,
  match_rate_95: 3,
  '7_day_no_incident': 5,
  emergency_stop: -15,
  rollback: -10,
  guardrail_trigger: -10,
  user_interrupt: -5,
};

// ── 에스컬레이션 쿨다운 (ms) ──

const ESCALATION_COOLDOWN_MS = 30 * 60 * 1000;

// ── 기본 컴포넌트 값 ──

function defaultComponents() {
  return {
    pdcaCompletionRate: { completedPdca: 5, totalPdca: 10 },
    gatePassRate: { passedGates: 5, totalGates: 10 },
    rollbackFrequency: { rollbacks: 5 },
    destructiveBlockRate: { blockedDestructive: 0, totalDestructive: 0 },
    iterationEfficiency: { consecutiveSuccesses: 5 },
    userOverrideRate: { overrides: 5 },
  };
}

// ── 컴포넌트 점수 계산 ──

function computeComponentScore(name, data) {
  switch (name) {
    case 'pdcaCompletionRate': {
      if (data.totalPdca === 0) return 0;
      return (data.completedPdca / data.totalPdca) * 100;
    }
    case 'gatePassRate': {
      if (data.totalGates === 0) return 0;
      return (data.passedGates / data.totalGates) * 100;
    }
    case 'rollbackFrequency': {
      if (data.rollbacks >= 10) return 0;
      return ((10 - data.rollbacks) / 10) * 100;
    }
    case 'destructiveBlockRate': {
      if (data.totalDestructive === 0) return 100;
      return (data.blockedDestructive / data.totalDestructive) * 100;
    }
    case 'iterationEfficiency': {
      const score = (data.consecutiveSuccesses / 10) * 100;
      return Math.min(score, 100);
    }
    case 'userOverrideRate': {
      if (data.overrides >= 10) return 0;
      return ((10 - data.overrides) / 10) * 100;
    }
    default:
      return 0;
  }
}

// ── 가중 평균 계산 ──

function computeWeightedScore(components) {
  let score = 0;
  for (const [name, weight] of Object.entries(WEIGHTS)) {
    const compData = components[name];
    if (compData) {
      score += computeComponentScore(name, compData) * weight;
    }
  }
  return score;
}

// ── 점수 → 레벨 ──

function scoreToLevel(score) {
  for (const { level, min } of LEVEL_THRESHOLDS) {
    if (score >= min) return level;
  }
  return 'L0';
}

// ── 다음 레벨 임계치 ──

function getNextLevelThreshold(currentLevel) {
  const idx = LEVEL_THRESHOLDS.findIndex(t => t.level === currentLevel);
  if (idx <= 0) return null; // L4이면 다음 없음
  return LEVEL_THRESHOLDS[idx - 1].min;
}

// ── 프로필 경로 ──

function getProfilePath(projectRoot) {
  return path.join(projectRoot, '.harness', 'state', 'trust-profile.json');
}

// ── 클램핑 ──

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// ── 프로필 읽기 ──

function readProfile(projectRoot) {
  const filePath = getProfilePath(projectRoot);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// ── 프로필 쓰기 ──

function writeProfile(projectRoot, profile) {
  const filePath = getProfilePath(projectRoot);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(profile, null, 2), 'utf-8');
}

// ── 기본 프로필 초기화 ──

function initProfile() {
  const components = defaultComponents();
  const score = 50;
  return {
    score,
    level: scoreToLevel(score),
    components,
    rawScore: score,
    previousScore: null,
    lastEscalationTime: null,
    autoEscalation: true,
    lastUpdated: new Date().toISOString(),
  };
}

// ── 공개 API ──

/**
 * 현재 신뢰 점수를 반환한다.
 *
 * @param {string} projectRoot - 프로젝트 루트 경로
 * @returns {number} 0-100 사이의 점수
 */
function getScore(projectRoot) {
  const profile = readProfile(projectRoot);
  if (!profile) {
    const init = initProfile();
    writeProfile(projectRoot, init);
    return init.score;
  }
  return profile.score;
}

/**
 * 이벤트를 기록하고 점수를 조정한다.
 *
 * @param {string} projectRoot - 프로젝트 루트 경로
 * @param {string} eventType - 이벤트 타입
 */
function recordEvent(projectRoot, eventType) {
  let profile = readProfile(projectRoot);
  if (!profile) {
    profile = initProfile();
  }

  const delta = EVENT_DELTAS[eventType];
  if (delta === undefined) {
    // 알 수 없는 이벤트 — 변화 없이 저장
    profile.lastUpdated = new Date().toISOString();
    writeProfile(projectRoot, profile);
    return;
  }

  profile.previousScore = profile.score;
  const newRawScore = (profile.rawScore != null ? profile.rawScore : profile.score) + delta;
  profile.rawScore = clamp(newRawScore, 0, 100);
  profile.score = profile.rawScore;
  profile.level = scoreToLevel(profile.score);
  profile.lastUpdated = new Date().toISOString();

  writeProfile(projectRoot, profile);
}

/**
 * 에스컬레이션 여부를 판정한다.
 *
 * @param {string} projectRoot - 프로젝트 루트 경로
 * @returns {boolean}
 */
function shouldEscalate(projectRoot) {
  const profile = readProfile(projectRoot);
  if (!profile) return false;
  if (!profile.autoEscalation) return false;

  const nextThreshold = getNextLevelThreshold(profile.level);
  if (nextThreshold === null) return false;

  if (profile.score < nextThreshold) return false;

  // 쿨다운 확인
  if (profile.lastEscalationTime) {
    const elapsed = Date.now() - new Date(profile.lastEscalationTime).getTime();
    if (elapsed < ESCALATION_COOLDOWN_MS) return false;
  }

  return true;
}

/**
 * 다운그레이드 여부를 판정한다.
 *
 * @param {string} projectRoot - 프로젝트 루트 경로
 * @returns {boolean}
 */
function shouldDowngrade(projectRoot) {
  const profile = readProfile(projectRoot);
  if (!profile) return false;
  if (profile.previousScore === null || profile.previousScore === undefined) return false;

  const drop = profile.previousScore - profile.score;
  return drop >= 15;
}

/**
 * 전체 프로필을 반환한다.
 *
 * @param {string} projectRoot - 프로젝트 루트 경로
 * @returns {object} { score, level, components, lastUpdated }
 */
function getProfile(projectRoot) {
  let profile = readProfile(projectRoot);
  if (!profile) {
    profile = initProfile();
    writeProfile(projectRoot, profile);
  }
  return {
    score: profile.score,
    level: profile.level,
    components: profile.components,
    lastUpdated: profile.lastUpdated,
  };
}

module.exports = {
  getScore,
  recordEvent,
  shouldEscalate,
  shouldDowngrade,
  getProfile,
};
