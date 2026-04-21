/**
 * Harness Engine — PDCA 진행률 시각화
 *
 * featureState를 받아 compact(한 줄) 또는 full(3줄 박스) 형태로 렌더링한다.
 * ansi.js에 의존하여 색상, 심볼, 진행 바, 박스를 그린다.
 */

const ansi = require('./ansi');

// ---------------------------------------------------------------------------
// Phase 정의
// ---------------------------------------------------------------------------

const PHASES = [
  'init', 'discovery', 'plan', 'design', 'do', 'check', 'act', 'report', 'archived'
];

/** 표시용 레이블 (대문자) */
const PHASE_LABELS = {
  init: 'INIT',
  discovery: 'DISC',
  plan: 'PLAN',
  design: 'DESIGN',
  do: 'DO',
  check: 'CHECK',
  act: 'ACT',
  report: 'REPORT',
  archived: 'ARCHIVED',
};

// ---------------------------------------------------------------------------
// 내부 헬퍼
// ---------------------------------------------------------------------------

/**
 * phase 인덱스를 반환한다.
 */
function phaseIndex(phase) {
  const idx = PHASES.indexOf(phase);
  return idx === -1 ? 0 : idx;
}

/**
 * 각 phase에 대해 완료/현재/대기 심볼을 붙여 문자열 배열을 반환한다.
 * 표시 대상 phase: plan, design, do, check, report (주요 5단계)
 */
const DISPLAY_PHASES = ['plan', 'design', 'do', 'check', 'report'];

function phaseIndicators(currentPhase, opts) {
  const currentIdx = phaseIndex(currentPhase);
  return DISPLAY_PHASES.map(function (p) {
    const pIdx = phaseIndex(p);
    const label = PHASE_LABELS[p];
    let sym;
    if (currentPhase === 'archived' || pIdx < currentIdx) {
      sym = ansi.symbol('done', opts);
    } else if (pIdx === currentIdx) {
      sym = ansi.symbol('running', opts);
    } else {
      sym = ansi.symbol('pending', opts);
    }
    return label + sym;
  });
}

/**
 * 경과 시간을 사람이 읽기 쉬운 문자열로 변환한다.
 */
function timeAgo(updatedAt) {
  if (!updatedAt) return 'n/a';
  const diff = Date.now() - new Date(updatedAt).getTime();
  if (diff < 0) return 'just now';
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return seconds + 's ago';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + 'm ago';
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + 'h ago';
  const days = Math.floor(hours / 24);
  return days + 'd ago';
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * 한 줄 compact 요약을 렌더링한다.
 *
 * 예: feature-name  PLAN✓ DESIGN✓ DO▶ CHECK· REPORT·  ████░░  50%
 *
 * @param {object} featureState - { name, phase, matchRate, iterationCount, updatedAt }
 * @param {object} [opts] - { forceNoColor, forceTTY }
 * @returns {string}
 */
function renderCompact(featureState, opts) {
  const name = featureState.name || 'unknown';
  const rate = featureState.matchRate || 0;
  const indicators = phaseIndicators(featureState.phase, opts).join('  ');
  const bar = ansi.progressBar(rate, 100, 12, opts);
  const pct = rate + '%';

  return name + '  ' + indicators + '  ' + bar + '  ' + pct;
}

/**
 * 3줄 박스 형태로 렌더링한다.
 *
 * ┌───  feature-name ────────────── 50% ─┐
 * │  PLAN✓  DESIGN✓  DO▶  CHECK·  REPORT·  ████████░░░░  │
 * └─ do • last: 3m ago • iter: 2                          ┘
 *
 * @param {object} featureState - { name, phase, matchRate, iterationCount, updatedAt }
 * @param {object} [opts] - { forceNoColor, forceTTY, width }
 * @returns {string}
 */
function renderFull(featureState, opts) {
  const name = featureState.name || 'unknown';
  const rate = featureState.matchRate || 0;
  const phase = featureState.phase || 'init';
  const iter = featureState.iterationCount || 0;
  const ago = timeAgo(featureState.updatedAt);

  const title = name + ' ' + rate + '%';
  const indicators = phaseIndicators(phase, opts).join('  ');
  const bar = ansi.progressBar(rate, 100, 12, opts);
  const line1 = indicators + '  ' + bar;
  const line2 = phase + ' \u2022 last: ' + ago + ' \u2022 iter: ' + iter;

  return ansi.box(title, [line1, line2], opts);
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  renderCompact: renderCompact,
  renderFull: renderFull,
};
