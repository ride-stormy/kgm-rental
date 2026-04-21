/**
 * Harness Engine — Config Migrator
 *
 * 레거시 config.json에 새 섹션(automation, structure 등)을 마이그레이션한다.
 * 멱등성: 이미 존재하는 섹션은 건드리지 않는다.
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * config.json에 주입하는 섹션별 기본값 레지스트리.
 * 새 섹션 추가 시 여기에만 항목을 추가하면 된다.
 */
const SECTION_DEFAULTS = {
  automation: {
    defaultLevel: 2,
    trustScoreEnabled: true,
    autoEscalation: false,
    autoDowngrade: true,
    emergencyStopEnabled: true,
  },
  structure: {
    enforce: true,
  },
};

/** 하위 호환 alias */
const AUTOMATION_DEFAULTS = SECTION_DEFAULTS.automation;

/**
 * 프로젝트의 .harness/config.json에 누락된 섹션을 마이그레이션한다.
 *
 * - config.json이 없으면 아무것도 하지 않는다 (init 전).
 * - 깨진 JSON이면 에러를 던진다.
 * - 누락된 섹션만 SECTION_DEFAULTS 기본값으로 추가 후 저장한다.
 * - 이미 존재하는 섹션은 건드리지 않는다 (멱등성).
 *
 * @param {string} projectRoot - 프로젝트 루트 경로
 */
function migrate(projectRoot) {
  const configPath = path.join(projectRoot, '.harness', 'config.json');

  if (!fs.existsSync(configPath)) {
    return;
  }

  const raw = fs.readFileSync(configPath, 'utf-8');

  let config;
  try {
    config = JSON.parse(raw);
  } catch (err) {
    throw new Error(`config.json 파싱 실패: ${err.message}`);
  }

  let dirty = false;
  for (const [section, defaults] of Object.entries(SECTION_DEFAULTS)) {
    if (config[section] == null) {
      config[section] = { ...defaults };
      dirty = true;
    }
  }

  if (dirty) {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
  }
}

module.exports = { migrate, AUTOMATION_DEFAULTS, SECTION_DEFAULTS };
