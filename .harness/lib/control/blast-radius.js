/**
 * lib/control/blast-radius.js
 *
 * 변경 영향도(blast radius) 태깅 모듈.
 * changes 객체를 받아 6개 rule(B-001~B-006)을 평가하고
 * 최고 수준의 level과 트리거된 rule ID 목록을 반환한다.
 *
 * 레벨 우선순위: critical > high > medium > low
 */

'use strict';

const LEVEL_PRIORITY = { low: 0, medium: 1, high: 2, critical: 3 };

/**
 * @typedef {Object} Changes
 * @property {string[]} files      - 변경된 파일 경로 목록
 * @property {number}   additions  - 추가된 줄 수
 * @property {number}   deletions  - 삭제된 줄 수
 * @property {string[]} newFiles   - 신규 생성 파일 경로 목록
 */

/**
 * @typedef {Object} Assessment
 * @property {'low'|'medium'|'high'|'critical'} level
 * @property {string[]} rules - 트리거된 rule ID 목록
 */

const DEPENDENCY_FILES = ['package.json', 'yarn.lock', 'package-lock.json'];
const CONFIG_FILES = ['.env', 'config.json', 'settings.json'];

/**
 * 파일 경로의 basename을 반환한다.
 * path 모듈 없이 순수 문자열 처리.
 * @param {string} filePath
 * @returns {string}
 */
function basename(filePath) {
  const parts = filePath.split('/');
  return parts[parts.length - 1] || filePath;
}

/**
 * 변경 영향도를 평가한다.
 *
 * @param {Changes} changes
 * @returns {Assessment}
 */
function assess(changes) {
  const files = changes.files || [];
  const additions = changes.additions || 0;
  const deletions = changes.deletions || 0;
  const newFiles = changes.newFiles || [];

  const triggered = [];
  let maxLevel = 'low';

  function trigger(ruleId, level) {
    triggered.push(ruleId);
    if (LEVEL_PRIORITY[level] > LEVEL_PRIORITY[maxLevel]) {
      maxLevel = level;
    }
  }

  // B-001: 단일 파일 크기 변경 >500줄 → high
  if (additions + deletions > 500) {
    trigger('B-001', 'high');
  }

  // B-002: 변경 파일 10개 이상 → high
  if (files.length >= 10) {
    trigger('B-002', 'high');
  }

  // B-003: 신규 파일 생성 20개 이상 → critical
  if (newFiles.length >= 20) {
    trigger('B-003', 'critical');
  }

  // B-004: package.json / yarn.lock / package-lock.json 변경 → medium
  const hasDependencyChange = files.some(function (f) {
    return DEPENDENCY_FILES.indexOf(basename(f)) !== -1;
  });
  if (hasDependencyChange) {
    trigger('B-004', 'medium');
  }

  // B-005: migration 파일 포함 (파일명에 migration 포함) → high
  const hasMigration = files.some(function (f) {
    return basename(f).toLowerCase().indexOf('migration') !== -1;
  });
  if (hasMigration) {
    trigger('B-005', 'high');
  }

  // B-006: .env / config.json / settings.json 변경 → medium
  const hasConfigChange = files.some(function (f) {
    return CONFIG_FILES.indexOf(basename(f)) !== -1;
  });
  if (hasConfigChange) {
    trigger('B-006', 'medium');
  }

  return { level: maxLevel, rules: triggered };
}

module.exports = { assess };
