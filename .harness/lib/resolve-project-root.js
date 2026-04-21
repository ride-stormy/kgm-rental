/**
 * Harness Engine — 프로젝트 루트 탐색
 *
 * process.cwd()가 하위 디렉토리(frontend/, backend/ 등)일 때
 * 진짜 프로젝트 루트를 상향 탐색으로 찾는다.
 *
 * 탐색 순서:
 *   1. .harness/config.json 존재 여부 (초기화 완료 마커)
 *   2. .git 존재 여부 (git 루트)
 *   3. 둘 다 없으면 startDir 반환 (init 전 상태 호환)
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * 프로젝트 루트를 탐색한다.
 *
 * @param {string} [startDir=process.cwd()] - 탐색 시작 디렉토리
 * @returns {string} 프로젝트 루트 경로
 */
function resolveProjectRoot(startDir) {
  const dir = startDir || process.cwd();

  // Phase 1: .harness/config.json 상향 탐색
  let current = dir;
  while (true) {
    if (fs.existsSync(path.join(current, '.harness', 'config.json'))) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) break; // 루트 도달
    current = parent;
  }

  // Phase 2: .git 상향 탐색
  current = dir;
  while (true) {
    if (fs.existsSync(path.join(current, '.git'))) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) break; // 루트 도달
    current = parent;
  }

  // Phase 3: 둘 다 없으면 startDir 반환
  return dir;
}

module.exports = { resolveProjectRoot };
