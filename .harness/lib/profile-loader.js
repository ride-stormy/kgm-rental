/**
 * Harness Engine — 프로필 로더
 *
 * 스택 프로필을 로드하고 검증하여 하네스 전역에 적용한다.
 *
 * 프로필 탐색 순서:
 *   1. {project}/.harness/profiles/{name}/   (프로젝트 로컬 오버라이드)
 *   2. {plugin}/profiles/{name}/             (플러그인 번들)
 */

const fs = require('fs');
const path = require('path');

// 플러그인 내장 프로필 경로
const BUILTIN_PROFILES_DIR = path.join(__dirname, '..', 'profiles');

/**
 * 프로필을 로드한다.
 *
 * @param {string} profileName - 프로필 이름
 * @param {string} [projectRoot] - 프로젝트 루트 (로컬 오버라이드 탐색용)
 * @returns {object} 로드된 프로필 객체
 */
function loadProfile(profileName, projectRoot) {
  // 1. 프로젝트 로컬 오버라이드 확인
  if (projectRoot) {
    const localPath = path.join(projectRoot, '.harness', 'profiles', profileName, 'profile.json');
    if (fs.existsSync(localPath)) {
      let profile;
      try {
        profile = JSON.parse(fs.readFileSync(localPath, 'utf-8'));
      } catch (e) {
        throw new Error(`Profile "${profileName}": invalid JSON in profile.json`);
      }
      profile._source = 'local';
      profile._path = path.dirname(localPath);
      return profile;
    }
  }

  // 2. 플러그인 번들 프로필
  const builtinPath = path.join(BUILTIN_PROFILES_DIR, profileName, 'profile.json');
  if (fs.existsSync(builtinPath)) {
    let profile;
    try {
      profile = JSON.parse(fs.readFileSync(builtinPath, 'utf-8'));
    } catch (e) {
      throw new Error(`Profile "${profileName}": invalid JSON in profile.json`);
    }
    profile._source = 'builtin';
    profile._path = path.dirname(builtinPath);
    return profile;
  }

  throw new Error(`Profile "${profileName}" not found`);
}

/**
 * 사용 가능한 프로필 목록을 반환한다.
 */
function listProfiles(projectRoot) {
  const profiles = [];

  // 내장 프로필
  if (fs.existsSync(BUILTIN_PROFILES_DIR)) {
    const builtinDirs = fs.readdirSync(BUILTIN_PROFILES_DIR).filter((name) => {
      if (name.startsWith('_')) return false;
      const profileJson = path.join(BUILTIN_PROFILES_DIR, name, 'profile.json');
      return fs.existsSync(profileJson);
    });
    for (const dir of builtinDirs) {
      let profile;
      try {
        profile = JSON.parse(
          fs.readFileSync(path.join(BUILTIN_PROFILES_DIR, dir, 'profile.json'), 'utf-8')
        );
      } catch (e) {
        throw new Error(`Profile "${dir}": invalid JSON in profile.json`);
      }
      profiles.push({
        name: profile.name,
        version: profile.version,
        source: 'builtin',
        architecture: profile.architecture || 'custom',
      });
    }
  }

  // 프로젝트 로컬 프로필
  if (projectRoot) {
    const localDir = path.join(projectRoot, '.harness', 'profiles');
    if (fs.existsSync(localDir)) {
      const localDirs = fs.readdirSync(localDir).filter((name) => {
        if (name.startsWith('_')) return false;
        const profileJson = path.join(localDir, name, 'profile.json');
        return fs.existsSync(profileJson);
      });
      for (const dir of localDirs) {
        let profile;
        try {
          profile = JSON.parse(
            fs.readFileSync(path.join(localDir, dir, 'profile.json'), 'utf-8')
          );
        } catch (e) {
          throw new Error(`Profile "${dir}": invalid JSON in profile.json`);
        }
        const existing = profiles.findIndex((p) => p.name === profile.name);
        if (existing >= 0) {
          profiles[existing].source = 'local (override)';
        } else {
          profiles.push({
            name: profile.name,
            version: profile.version,
            source: 'local',
            architecture: profile.architecture || 'custom',
          });
        }
      }
    }
  }

  return profiles;
}

/**
 * 프로필을 _schema.json에 대해 검증한다.
 */
function validateProfile(profile) {
  const errors = [];

  if (!profile.name || typeof profile.name !== 'string') {
    errors.push('name: 필수 문자열');
  } else if (!/^[a-z0-9-]+$/.test(profile.name)) {
    errors.push('name: 소문자, 숫자, 하이픈만 허용');
  }

  if (!profile.version || typeof profile.version !== 'string') {
    errors.push('version: 필수 문자열');
  } else if (!/^\d+\.\d+\.\d+$/.test(profile.version)) {
    errors.push('version: semver 형식 필요 (예: 1.0.0)');
  }

  const validArchitectures = ['flat', 'mvc', 'ddd-3layer', 'ddd-4layer', 'clean', 'hexagonal', 'custom'];
  if (profile.architecture && !validArchitectures.includes(profile.architecture)) {
    errors.push(`architecture: 유효한 값 — ${validArchitectures.join(', ')}`);
  }

  const validEslintConfigs = ['recommended', 'strict', 'ddd'];
  if (profile.eslintConfig && !validEslintConfigs.includes(profile.eslintConfig)) {
    errors.push(`eslintConfig: 유효한 값 — ${validEslintConfigs.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 프로필의 commands 필드에 필수 명령어가 있는지 검증한다.
 *
 * do 단계 진입 전 호출하여 blank 프로필 또는 commands가 비어있는 프로필에서
 * 빌드/타입체크/린트/smokeTest 없이 구현 단계에 진입하는 것을 차단한다.
 *
 * @param {object} profile - 로드된 프로필 객체
 * @throws {Error} 필수 commands가 누락된 경우
 */
function validateCommands(profile) {
  const required = ['build', 'typecheck', 'lint', 'smokeTest'];
  const commands = profile && typeof profile.commands === 'object' && profile.commands !== null
    ? profile.commands
    : {};

  const missing = required.filter((key) => {
    const val = commands[key];
    return !val || typeof val !== 'string' || val.trim() === '';
  });

  if (missing.length > 0) {
    throw new Error(
      `프로필 "${profile && profile.name ? profile.name : '(unknown)'}": ` +
      `do 단계 진입 불가 — commands에 필수 항목 누락: ${missing.join(', ')}. ` +
      `profile.json의 commands 필드에 build/typecheck/lint/smokeTest를 모두 설정하세요.`
    );
  }
}

module.exports = {
  loadProfile,
  listProfiles,
  validateProfile,
  validateCommands,
  BUILTIN_PROFILES_DIR,
};
