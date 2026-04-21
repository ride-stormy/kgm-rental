/**
 * Harness Engine — 세션 매니저
 *
 * 세션 생명주기를 관리한다.
 * 상태 저장: {projectRoot}/.harness/state/session-history.json
 * 최신 50개 세션 이력을 유지한다.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MAX_SESSIONS = 50;

/**
 * session-history.json 경로를 반환한다.
 */
function getHistoryPath(projectRoot) {
  return path.join(projectRoot, '.harness', 'state', 'session-history.json');
}

/**
 * session-history.json을 읽어 파싱한다.
 * 파일이 없거나 깨진 JSON이면 기본 구조를 반환한다.
 *
 * @param {string} projectRoot
 * @returns {{ sessions: Array }}
 */
function readHistory(projectRoot) {
  const filePath = getHistoryPath(projectRoot);
  if (!fs.existsSync(filePath)) {
    return { sessions: [] };
  }
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    if (!Array.isArray(data.sessions)) {
      return { sessions: [] };
    }
    return data;
  } catch (_) {
    return { sessions: [] };
  }
}

/**
 * session-history.json에 기록한다.
 *
 * @param {string} projectRoot
 * @param {{ sessions: Array }} history
 */
function writeHistory(projectRoot, history) {
  const filePath = getHistoryPath(projectRoot);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(history, null, 2), 'utf-8');
}

/**
 * 새 세션을 시작한다.
 *
 * @param {string} projectRoot - 프로젝트 루트 경로
 * @returns {{ sessionId: string, sessionCount: number, startedAt: string }}
 */
function startSession(projectRoot) {
  const history = readHistory(projectRoot);
  const sessionId = crypto.randomUUID();
  const startedAt = new Date().toISOString();

  history.sessions.push({
    sessionId,
    startedAt,
    endedAt: null,
  });

  // 최대 50개 유지 — 초과 시 가장 오래된 것 제거
  while (history.sessions.length > MAX_SESSIONS) {
    history.sessions.shift();
  }

  writeHistory(projectRoot, history);

  return {
    sessionId,
    sessionCount: history.sessions.length,
    startedAt,
  };
}

/**
 * 세션을 종료한다.
 * 해당 sessionId가 없으면 조용히 무시한다.
 *
 * @param {string} projectRoot - 프로젝트 루트 경로
 * @param {string} sessionId - 종료할 세션 ID
 */
function endSession(projectRoot, sessionId) {
  const history = readHistory(projectRoot);
  const session = history.sessions.find(s => s.sessionId === sessionId);
  if (!session) {
    return;
  }
  session.endedAt = new Date().toISOString();
  writeHistory(projectRoot, history);
}

/**
 * 마지막 세션 정보를 반환한다.
 * 세션이 없거나 JSON이 깨졌으면 null을 반환한다.
 *
 * @param {string} projectRoot - 프로젝트 루트 경로
 * @returns {{ sessionId: string, startedAt: string, endedAt: string|null }|null}
 */
function getLastSession(projectRoot) {
  const history = readHistory(projectRoot);
  if (history.sessions.length === 0) {
    return null;
  }
  return history.sessions[history.sessions.length - 1];
}

/**
 * 누적 세션 수를 반환한다.
 *
 * @param {string} projectRoot - 프로젝트 루트 경로
 * @returns {number}
 */
function getSessionCount(projectRoot) {
  const history = readHistory(projectRoot);
  return history.sessions.length;
}

/**
 * endedAt: null인 orphan 세션을 현재 시각으로 마감한다.
 * SessionStart 시 호출하여 이전 세션이 비정상 종료된 경우 정리한다.
 *
 * @param {string} projectRoot - 프로젝트 루트 경로
 * @returns {number} 마감한 orphan 세션 수
 */
function closeOrphanSessions(projectRoot) {
  const history = readHistory(projectRoot);
  const now = new Date().toISOString();
  let closedCount = 0;

  for (const session of history.sessions) {
    if (session.endedAt === null || session.endedAt === undefined) {
      session.endedAt = now;
      closedCount += 1;
    }
  }

  if (closedCount > 0) {
    writeHistory(projectRoot, history);
  }

  return closedCount;
}

module.exports = {
  startSession,
  endSession,
  getLastSession,
  getSessionCount,
  closeOrphanSessions,
};
