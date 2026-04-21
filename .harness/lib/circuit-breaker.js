/**
 * Harness Engine — Circuit Breaker
 *
 * PDCA iterate 루프에서 진전 없는 반복을 감지하고 차단한다.
 * 프로젝트별 인메모리 상태를 Map으로 관리한다.
 *
 * 감지 패턴:
 *   1. stagnation    — matchRate 3회 연속 동일값 (±0.1% 이내)
 *   2. repeated_error — 동일 에러 메시지 3회 반복
 *   3. oscillation   — matchRate 3회에 걸쳐 ±5% 이내 왕복
 *
 * 상태: closed (정상) → open (차단) → half-open (시험 재개)
 */

'use strict';

const STATE = {
  CLOSED: 'closed',
  OPEN: 'open',
  HALF_OPEN: 'half-open',
};

const HISTORY_LIMIT = 20;

/** @type {Map<string, {state: string, history: number[], errorCounts: Map<string, number>, detectedPattern: string|null}>} */
const store = new Map();

function getEntry(projectRoot) {
  if (!store.has(projectRoot)) {
    store.set(projectRoot, {
      state: STATE.CLOSED,
      history: [],
      errorCounts: new Map(),
      detectedPattern: null,
    });
  }
  return store.get(projectRoot);
}

// ── 패턴 감지 ──

function detectStagnation(history) {
  if (history.length < 3) return false;
  const last3 = history.slice(-3);
  const base = last3[0];
  return last3.every((v) => Math.abs(v - base) <= 0.1);
}

function detectRepeatedError(errorCounts) {
  for (const count of errorCounts.values()) {
    if (count >= 3) return true;
  }
  return false;
}

/**
 * a→b→c에서 방향이 바뀌고 전체 범위가 ±5% 이내인 왕복 패턴.
 */
function detectOscillation(history) {
  if (history.length < 3) return false;
  const last3 = history.slice(-3);
  const [a, b, c] = last3;
  const d1 = b - a;
  const d2 = c - b;

  if (d1 === 0 || d2 === 0) return false;
  if ((d1 > 0 && d2 > 0) || (d1 < 0 && d2 < 0)) return false;

  return (Math.max(a, b, c) - Math.min(a, b, c)) <= 5;
}

function detectPattern(entry) {
  if (detectStagnation(entry.history)) return 'stagnation';
  if (detectRepeatedError(entry.errorCounts)) return 'repeated_error';
  if (detectOscillation(entry.history)) return 'oscillation';
  return null;
}

// ── 공개 API ──

function record(projectRoot, matchRate, errors) {
  const entry = getEntry(projectRoot);

  if (entry.state === STATE.OPEN) {
    return;
  }

  entry.history.push(matchRate);
  if (entry.history.length > HISTORY_LIMIT) {
    entry.history.shift();
  }

  const errs = errors || [];
  for (const msg of errs) {
    entry.errorCounts.set(msg, (entry.errorCounts.get(msg) || 0) + 1);
  }

  const pattern = detectPattern(entry);

  if (entry.state === STATE.HALF_OPEN) {
    if (pattern) {
      entry.state = STATE.OPEN;
      entry.detectedPattern = pattern;
    } else {
      entry.state = STATE.CLOSED;
      entry.detectedPattern = null;
    }
    return;
  }

  if (pattern) {
    entry.state = STATE.OPEN;
    entry.detectedPattern = pattern;
  }
}

function isOpen(projectRoot) {
  return getEntry(projectRoot).state === STATE.OPEN;
}

/**
 * open → half-open 전환.
 * history는 보존한다 — half-open에서 같은 패턴이 단 1회 record로 재발하면 즉시 재차단해야 하기 때문.
 * errorCounts는 초기화하여 에러 기반 패턴은 새 시도에서 다시 누적된다.
 */
function tryReset(projectRoot) {
  const entry = getEntry(projectRoot);
  if (entry.state === STATE.OPEN) {
    entry.state = STATE.HALF_OPEN;
    entry.errorCounts = new Map();
    entry.detectedPattern = null;
  }
}

function getState(projectRoot) {
  return getEntry(projectRoot).state;
}

/**
 * 완전 초기화. 상태와 히스토리를 모두 제거한다.
 */
function reset(projectRoot) {
  store.delete(projectRoot);
}

module.exports = { record, isOpen, tryReset, getState, reset };
