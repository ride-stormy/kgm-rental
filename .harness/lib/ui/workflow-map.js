/**
 * Harness Engine — 파이프라인 워크플로우 맵
 *
 * featureState를 받아 파이프라인 다이어그램을 박스 형태로 렌더링한다.
 * ansi.js에 의존.
 */

const ansi = require('./ansi');

// ---------------------------------------------------------------------------
// Phase 정의
// ---------------------------------------------------------------------------

const PHASES = [
  'init', 'discovery', 'plan', 'design', 'do', 'check', 'act', 'report', 'archived'
];

const DISPLAY_PHASES = ['plan', 'design', 'do', 'check', 'report'];

const PHASE_LABELS = {
  plan: 'PLAN',
  design: 'DESIGN',
  do: 'DO',
  check: 'CHECK',
  report: 'REPORT',
};

// ---------------------------------------------------------------------------
// 내부 헬퍼
// ---------------------------------------------------------------------------

function phaseIndex(phase) {
  const idx = PHASES.indexOf(phase);
  return idx === -1 ? 0 : idx;
}

function phaseSymbol(displayPhase, currentPhase, opts) {
  const currentIdx = phaseIndex(currentPhase);
  const pIdx = phaseIndex(displayPhase);
  if (currentPhase === 'archived' || pIdx < currentIdx) {
    return ansi.symbol('done', opts);
  } else if (pIdx === currentIdx) {
    return ansi.symbol('running', opts);
  }
  return ansi.symbol('pending', opts);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * 워크플로우 맵을 렌더링한다.
 *
 * ┌─── Workflow Map: feature-name ───────────────────────┐
 * │  [PLAN ✓]──→[DESIGN ✓]──→[DO ▶]──→[CHECK ·]──→[REPORT ·]  │
 * │    CHECK: ≥90% → REPORT  <90% → ACT • Iter: 2 • 75%  │
 * └──────────────────────────────────────────────────────┘
 *
 * @param {object} featureState - { name, phase, matchRate, iterationCount, updatedAt }
 * @param {object} [options] - { showMatchRate: boolean, showIter: boolean, forceNoColor, forceTTY, width }
 * @returns {string}
 */
function render(featureState, options) {
  const opts = options || {};
  const name = featureState.name || 'unknown';
  const phase = featureState.phase || 'init';
  const rate = featureState.matchRate || 0;
  const iter = featureState.iterationCount || 0;

  const title = 'Workflow Map: ' + name;

  // 파이프라인 행: [PLAN ✓]──→[DESIGN ✓]──→...
  const nodes = DISPLAY_PHASES.map(function (p) {
    const sym = phaseSymbol(p, phase, opts);
    return '[' + PHASE_LABELS[p] + ' ' + sym + ']';
  });
  const pipeline = nodes.join('\u2500\u2500\u2192');

  // 상태 행
  var statusParts = [];
  statusParts.push('CHECK: \u226590% \u2192 REPORT  <90% \u2192 ACT');
  if (opts.showIter !== false) {
    statusParts.push('Iter: ' + iter);
  }
  if (opts.showMatchRate !== false) {
    statusParts.push(rate + '%');
  }
  var statusLine = statusParts.join(' \u2022 ');

  return ansi.box(title, [pipeline, statusLine], opts);
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  render: render,
};
