/**
 * Harness Engine — ANSI 렌더링 유틸리티
 *
 * 터미널 출력을 위한 색상, 박스, 심볼, 진행 바 등 렌더링 기반 유틸리티.
 * NO_COLOR 환경 변수 및 non-TTY 환경을 자동 감지하여 plain text로 폴백한다.
 */

// ---------------------------------------------------------------------------
// 환경 감지 (동적 — 테스트에서 런타임 변경 가능)
// ---------------------------------------------------------------------------

function isNoColor(opts) {
  if (opts && opts.forceNoColor !== undefined) return !!opts.forceNoColor;
  return !!process.env.NO_COLOR;
}

function isTTY(opts) {
  if (opts && opts.forceTTY !== undefined) return !!opts.forceTTY;
  return !!process.stdout.isTTY;
}

/** 현재 터미널 폭 */
function getWidth() {
  return process.stdout.columns || 80;
}

/** 레이아웃 판별: narrow(<80), normal(80-119), wide(>=120) */
function getLayout() {
  const w = getWidth();
  if (w < 80) return 'narrow';
  if (w >= 120) return 'wide';
  return 'normal';
}

// ---------------------------------------------------------------------------
// 내부: 색상이 비활성이면 plain text 반환 여부 판별
// ---------------------------------------------------------------------------

function shouldStyle(opts) {
  return !isNoColor(opts) && isTTY(opts);
}

// ---------------------------------------------------------------------------
// 8색 ANSI
// ---------------------------------------------------------------------------

const COLOR_CODES = {
  black: 30,
  red: 31,
  green: 32,
  yellow: 33,
  blue: 34,
  magenta: 35,
  cyan: 36,
  white: 37,
};

/**
 * 텍스트에 ANSI 색상을 적용한다.
 *
 * @param {string} text
 * @param {string} colorName - black|red|green|yellow|blue|magenta|cyan|white
 * @param {object} [opts] - { forceNoColor, forceTTY }
 * @returns {string}
 */
function color(text, colorName, opts) {
  if (text === '') return '';
  if (!shouldStyle(opts)) return text;
  const code = COLOR_CODES[colorName];
  if (code === undefined) return text;
  return '\x1b[' + code + 'm' + text + '\x1b[0m';
}

/**
 * 굵게 표시
 */
function bold(text, opts) {
  if (text === '') return '';
  if (!shouldStyle(opts)) return text;
  return '\x1b[1m' + text + '\x1b[0m';
}

/**
 * 흐리게 표시
 */
function dim(text, opts) {
  if (text === '') return '';
  if (!shouldStyle(opts)) return text;
  return '\x1b[2m' + text + '\x1b[0m';
}

/**
 * 밑줄 표시
 */
function underline(text, opts) {
  if (text === '') return '';
  if (!shouldStyle(opts)) return text;
  return '\x1b[4m' + text + '\x1b[0m';
}

// ---------------------------------------------------------------------------
// 상태 심볼
// ---------------------------------------------------------------------------

const UNICODE_SYMBOLS = {
  done: '\u2713',     // ✓
  running: '\u25B6',  // ▶
  pending: '\u00B7',  // ·
  failed: '\u2717',   // ✗
  waiting: '!',
};

const ASCII_SYMBOLS = {
  done: '[OK]',
  running: '[>]',
  pending: '[.]',
  failed: '[X]',
  waiting: '[!]',
};

/**
 * 상태 이름에 해당하는 심볼을 반환한다.
 *
 * @param {string} name - done|running|pending|failed|waiting
 * @param {object} [opts] - { forceNoColor, forceTTY }
 * @returns {string}
 */
function symbol(name, opts) {
  const useUnicode = isTTY(opts);
  const map = useUnicode ? UNICODE_SYMBOLS : ASCII_SYMBOLS;
  return map[name] || '?';
}

// ---------------------------------------------------------------------------
// 진행 바
// ---------------------------------------------------------------------------

/**
 * 진행 바를 렌더링한다.
 *
 * @param {number} current
 * @param {number} total
 * @param {number} width - 바 영역의 폭 (문자 수)
 * @param {object} [opts] - { forceNoColor, forceTTY }
 * @returns {string}
 */
function progressBar(current, total, width, opts) {
  if (width <= 0) return '';
  const ratio = total <= 0 ? 0 : Math.min(current / total, 1);
  const filled = Math.round(ratio * width);
  const empty = width - filled;

  if (isNoColor(opts) || !isTTY(opts)) {
    return '[' + '='.repeat(filled) + ' '.repeat(empty) + ']';
  }

  return '\u2588'.repeat(filled) + '\u2591'.repeat(empty);
}

// ---------------------------------------------------------------------------
// Unicode Box Drawing
// ---------------------------------------------------------------------------

/**
 * 박스를 그린다.
 *
 * @param {string} title
 * @param {string[]} lines
 * @param {object} [options]
 * @param {number} [options.width] - 지정 안 하면 레이아웃 기반 자동
 * @param {boolean} [options.forceNoColor]
 * @param {boolean} [options.forceTTY]
 * @returns {string}
 */
function box(title, lines, options) {
  const opts = options || {};
  const layout = getLayout();
  const autoWidth = layout === 'narrow' ? 60 : layout === 'wide' ? 100 : 80;
  const outerWidth = opts.width || autoWidth;
  // 내부 콘텐츠 폭 = 외부 - 좌/우 테두리(│ ) 및 ( │) = 4
  const innerWidth = outerWidth - 4;
  const useUnicode = shouldStyle(opts);

  // 가로 줄의 총 길이 = outerWidth - 2 (좌우 코너 문자 제외)
  const hLineLen = outerWidth - 2;

  if (useUnicode) {
    // Unicode box
    const titleStr = title ? '\u2500 ' + title + ' \u2500' : '';
    const remainLen = Math.max(0, hLineLen - titleStr.length);
    const top = '\u250C' + titleStr + '\u2500'.repeat(remainLen) + '\u2510';
    const bottom = '\u2514' + '\u2500'.repeat(hLineLen) + '\u2518';

    const rows = lines.map(function (line) {
      const pad = innerWidth - stripAnsi(line).length;
      return '\u2502 ' + line + ' '.repeat(Math.max(0, pad)) + ' \u2502';
    });

    if (rows.length === 0) {
      return top + '\n' + bottom;
    }
    return top + '\n' + rows.join('\n') + '\n' + bottom;
  }

  // ASCII box
  const titleStr = title ? '- ' + title + ' -' : '';
  const remainLen = Math.max(0, hLineLen - titleStr.length);
  const top = '+' + titleStr + '-'.repeat(remainLen) + '+';
  const bottom = '+' + '-'.repeat(hLineLen) + '+';

  const rows = lines.map(function (line) {
    const pad = innerWidth - stripAnsi(line).length;
    return '| ' + line + ' '.repeat(Math.max(0, pad)) + ' |';
  });

  if (rows.length === 0) {
    return top + '\n' + bottom;
  }
  return top + '\n' + rows.join('\n') + '\n' + bottom;
}

/**
 * ANSI escape code를 제거하여 표시 길이를 계산하기 위한 헬퍼.
 */
function stripAnsi(str) {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  color: color,
  bold: bold,
  dim: dim,
  underline: underline,
  box: box,
  symbol: symbol,
  progressBar: progressBar,
  getLayout: getLayout,
  get NO_COLOR() { return isNoColor(); },
  get IS_TTY() { return isTTY(); },
};
