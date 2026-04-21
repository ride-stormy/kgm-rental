/**
 * Harness Engine — 변경 영향도 + matchRate 트렌드 시각화
 *
 * matchRate 바, 파일 트리, iteration 트렌드를 렌더링한다.
 * ansi.js에 의존.
 */

const ansi = require('./ansi');

// ---------------------------------------------------------------------------
// 내부 헬퍼
// ---------------------------------------------------------------------------

/**
 * matchRate 값에 따른 색상을 반환한다.
 *   >= 90  → green
 *   >= 70  → yellow
 *   <  70  → red
 */
function rateColor(rate) {
  if (rate >= 90) return 'green';
  if (rate >= 70) return 'yellow';
  return 'red';
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * matchRate 한 줄 바를 렌더링한다.
 *
 * Match Rate  ████████████████████░░░░  85%  (target: 90%)
 *
 * @param {number} rate - 현재 matchRate (0-100)
 * @param {number} target - 목표 matchRate
 * @param {object} [opts] - { forceNoColor, forceTTY, barWidth }
 * @returns {string}
 */
function renderMatchRate(rate, target, opts) {
  const o = opts || {};
  const barWidth = o.barWidth || 24;
  const bar = ansi.progressBar(rate, 100, barWidth, o);
  const colorName = rateColor(rate);
  const rateStr = ansi.color(rate + '%', colorName, o);
  return 'Match Rate  ' + bar + '  ' + rateStr + '  (target: ' + target + '%)';
}

/**
 * 파일 목록을 트리 형태로 렌더링한다.
 *
 * @param {string[]} files - 파일 경로 배열
 * @param {object} [opts] - { forceNoColor, forceTTY }
 * @returns {string}
 */
function renderFileTree(files, opts) {
  if (!files || files.length === 0) return '';
  const lines = files.map(function (f, i) {
    var prefix = (i === files.length - 1) ? '\u2514\u2500 ' : '\u251C\u2500 ';
    return prefix + f;
  });
  return lines.join('\n');
}

/**
 * iteration별 matchRate 트렌드를 렌더링한다.
 *
 * Iter  1 ████████████░░░░░░░░  60%
 * Iter  2 ████████████████░░░░  78%
 * Iter  3 ████████████████████  92% (current)
 *
 * @param {Array<{iter: number, matchRate: number}>} iterations - 최신이 마지막
 * @param {object} [opts] - { forceNoColor, forceTTY, barWidth }
 * @returns {string}
 */
function renderTrend(iterations, opts) {
  if (!iterations || iterations.length === 0) return '';
  const o = opts || {};
  const barWidth = o.barWidth || 20;
  var lines = iterations.map(function (item, idx) {
    var bar = ansi.progressBar(item.matchRate, 100, barWidth, o);
    var colorName = rateColor(item.matchRate);
    var pct = ansi.color(item.matchRate + '%', colorName, o);
    var suffix = (idx === iterations.length - 1) ? ' (current)' : '';
    return 'Iter  ' + item.iter + ' ' + bar + '  ' + pct + suffix;
  });
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  renderMatchRate: renderMatchRate,
  renderFileTree: renderFileTree,
  renderTrend: renderTrend,
};
