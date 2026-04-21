/**
 * Harness Engine — Automation Control Panel
 *
 * Automation Level 대시보드를 렌더링한다.
 * ansi.js에 의존.
 */

const ansi = require('./ansi');

// ---------------------------------------------------------------------------
// Level 정의
// ---------------------------------------------------------------------------

const LEVEL_NAMES = {
  0: 'Manual',
  1: 'Guided',
  2: 'Semi-Auto',
  3: 'Auto',
  4: 'Full-Auto',
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Automation Level 대시보드를 렌더링한다.
 *
 * Automation Level   L0 ─────●────────────── L4
 *                    [Current: L2 Semi-Auto]
 *
 * emergencyStop=true 이면 [EMERGENCY STOP] 을 추가 표시한다.
 *
 * @param {object} automationState - { level: 0-4, emergencyStop: boolean }
 * @param {object} [opts] - { forceNoColor, forceTTY }
 * @returns {string}
 */
function render(automationState, opts) {
  const state = automationState || {};
  const level = (state.level !== undefined && state.level !== null) ? state.level : 0;
  const emergency = !!state.emergencyStop;
  const name = LEVEL_NAMES[level] || 'Unknown';

  // 슬라이더 바 구성: 총 20칸, level에 따라 위치 결정
  var totalSlots = 20;
  var position = Math.round((level / 4) * totalSlots);

  var useUnicode = !ansi.NO_COLOR;

  var barLeft;
  var barRight;
  var marker;
  if (useUnicode) {
    barLeft = '\u2500'.repeat(position);
    marker = '\u25CF';
    barRight = '\u2500'.repeat(totalSlots - position);
  } else {
    barLeft = '-'.repeat(position);
    marker = '*';
    barRight = '-'.repeat(totalSlots - position);
  }

  var slider = 'L0 ' + barLeft + marker + barRight + ' L4';
  var line1 = 'Automation Level   ' + slider;

  var label = 'L' + level + ' ' + name;
  var line2 = '                   [Current: ' + label + ']';

  if (emergency) {
    var stopLabel = ansi.color('[EMERGENCY STOP]', 'red', opts);
    return line1 + '\n' + line2 + '  ' + stopLabel;
  }

  return line1 + '\n' + line2;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  render: render,
};
