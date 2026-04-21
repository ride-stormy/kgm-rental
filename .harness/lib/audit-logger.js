/**
 * Harness Engine — 감사 로거
 *
 * 모든 상태 전이와 의사결정을 JSONL 형식으로 기록한다.
 * 경로: {project}/.harness/logs/audit.jsonl
 */

const fs = require('fs');
const path = require('path');

function getLogPath(projectRoot) {
  return path.join(projectRoot, '.harness', 'logs', 'audit.jsonl');
}

/**
 * 이벤트를 감사 로그에 기록한다.
 *
 * @param {string} projectRoot - 프로젝트 루트 경로
 * @param {object} event - 이벤트 객체
 * @param {string} event.event - 이벤트 유형
 *   'state_transition' | 'checkpoint_created' | 'evaluation_completed' |
 *   'user_decision' | 'guard_failed' | 'config_changed' | 'feature_created' |
 *   'feature_cancelled'
 * @param {string} event.feature - 피처 이름
 * @param {object} event.data - 이벤트 데이터
 * @param {string} [event.session] - 세션 ID (선택)
 */
function log(projectRoot, event) {
  const logPath = getLogPath(projectRoot);
  const dir = path.dirname(logPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const entry = {
    timestamp: new Date().toISOString(),
    event: event.event,
    feature: event.feature || null,
    data: event.data || {},
    session: event.session || null,
    blastRadius: event.blastRadius || null,
  };

  fs.appendFileSync(logPath, JSON.stringify(entry) + '\n', 'utf-8');
  return entry;
}

/**
 * 감사 로그를 읽어 배열로 반환한다.
 */
function readAll(projectRoot) {
  const logPath = getLogPath(projectRoot);
  if (!fs.existsSync(logPath)) {
    return [];
  }
  const content = fs.readFileSync(logPath, 'utf-8').trim();
  if (!content) return [];
  return content.split('\n').reduce((acc, line) => {
    try {
      acc.push(JSON.parse(line));
    } catch (_) {
      // skip malformed lines
    }
    return acc;
  }, []);
}

/**
 * 특정 피처의 이벤트만 필터링한다.
 */
function queryByFeature(projectRoot, featureName) {
  return readAll(projectRoot).filter((e) => e.feature === featureName);
}

/**
 * 특정 이벤트 유형만 필터링한다.
 */
function queryByEvent(projectRoot, eventType) {
  return readAll(projectRoot).filter((e) => e.event === eventType);
}

/**
 * 특정 피처의 타임라인을 사람이 읽기 좋은 형식으로 반환한다.
 */
function getFeatureTimeline(projectRoot, featureName) {
  const events = queryByFeature(projectRoot, featureName);
  return events.map((e) => {
    const time = new Date(e.timestamp).toLocaleString('ko-KR');
    switch (e.event) {
      case 'state_transition':
        return `[${time}] ${e.data.from} → ${e.data.to}`;
      case 'user_decision':
        return `[${time}] 사용자 결정: ${e.data.decision}`;
      case 'evaluation_completed':
        return `[${time}] 검증 완료: matchRate ${e.data.matchRate}%`;
      case 'feature_created':
        return `[${time}] 피처 생성`;
      case 'feature_cancelled':
        return `[${time}] 피처 취소`;
      default:
        return `[${time}] ${e.event}`;
    }
  });
}

module.exports = {
  log,
  readAll,
  queryByFeature,
  queryByEvent,
  getFeatureTimeline,
  getLogPath,
};
