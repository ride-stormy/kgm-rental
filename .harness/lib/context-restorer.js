/**
 * Harness Engine — Context Restorer
 *
 * `/clear` 또는 새 세션 시작 시 프로젝트 컨텍스트를 복원한다.
 * state-machine과 session-manager를 조합하여 복원 가능한 최소 스냅샷을
 * 제공한다. 하네스가 초기화되지 않았거나 activeFeature가 없으면 기본값을 반환한다.
 * 상태 파일이 존재하지만 JSON 파싱에 실패한 경우 Error를 throw한다.
 */

'use strict';

const stateMachine = require('./state-machine');
const { getLastSession } = require('./session-manager');

/**
 * 하네스 미초기화 또는 activeFeature 부재 시의 기본 컨텍스트.
 *
 * @param {object|null} session
 * @returns {{
 *   phase: string,
 *   session: object|null,
 *   activeFeature: string|null,
 *   activeCheckpoints: string[],
 *   isTerminal: boolean,
 *   iterationCount: number,
 *   matchRate: number|null,
 *   history: object[],
 * }}
 */
function emptyContext(session) {
  return {
    phase: 'init',
    session: session || null,
    activeFeature: null,
    activeCheckpoints: [],
    isTerminal: false,
    iterationCount: 0,
    matchRate: null,
    history: [],
  };
}

/**
 * 현재 프로젝트의 컨텍스트를 복원한다.
 *
 * 읽기 대상:
 *   - `.harness/state/harness.json`          (activeFeature)
 *   - `.harness/state/features/<name>.json`  (phase, history, checkpoints)
 *   - `.harness/state/session-history.json`  (마지막 세션)
 *
 * @param {string} projectRoot
 * @returns {object} 위 emptyContext 스키마와 동일
 */
function restoreContext(projectRoot) {
  let session = null;
  try {
    session = getLastSession(projectRoot);
  } catch (_) {
    session = null;
  }

  let harness;
  try {
    harness = stateMachine.readHarnessState(projectRoot);
  } catch (e) {
    throw new Error('harness.json corrupted: ' + e.message);
  }

  if (!harness) {
    return emptyContext(session);
  }

  const activeFeature = harness.activeFeature || null;
  if (!activeFeature) {
    return emptyContext(session);
  }

  let featureState;
  try {
    featureState = stateMachine.readFeatureState(projectRoot, activeFeature);
  } catch (e) {
    throw new Error(`${activeFeature}.state.json corrupted: ` + e.message);
  }

  if (!featureState) {
    return {
      phase: 'init',
      session,
      activeFeature,
      activeCheckpoints: [],
      isTerminal: false,
      iterationCount: 0,
      matchRate: null,
      history: [],
    };
  }

  const phase = featureState.phase || 'init';

  return {
    phase,
    session,
    activeFeature,
    activeCheckpoints: Array.isArray(featureState.checkpoints) ? featureState.checkpoints : [],
    isTerminal: stateMachine.isTerminal(phase),
    iterationCount: typeof featureState.iterationCount === 'number' ? featureState.iterationCount : 0,
    matchRate: typeof featureState.matchRate === 'number' ? featureState.matchRate : null,
    history: Array.isArray(featureState.history) ? featureState.history : [],
  };
}

module.exports = { restoreContext };
