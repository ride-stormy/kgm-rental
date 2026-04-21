/**
 * Harness Engine — 상태 전이 가드 조건
 *
 * 각 가드는 순수 함수로, context 객체를 받아 boolean을 반환한다.
 * 상태 머신이 전이를 실행하기 전에 해당 가드를 평가한다.
 */

const fs = require('fs');
const path = require('path');

const guards = {
  // init → plan: 피처 이름이 존재하는가
  hasFeatureName(context) {
    return typeof context.featureName === 'string' && context.featureName.trim().length > 0;
  },

  // plan → design: Plan 문서가 존재하는가
  planDocumentExists(context) {
    const docPath = path.join(
      context.projectRoot,
      'docs', '01-plan', 'features', `${context.featureName}.plan.md`
    );
    return fs.existsSync(docPath);
  },

  // design → do: Design 문서가 존재하는가
  designDocumentApproved(context) {
    const docPath = path.join(
      context.projectRoot,
      'docs', '02-design', 'features', `${context.featureName}.design.md`
    );
    return fs.existsSync(docPath);
  },

  // do → check: 구현 코드가 존재하는가
  implementationExists(context) {
    return (context.newFilesCount || 0) > 0 || (context.modifiedFilesCount || 0) > 0;
  },

  // check → act: matchRate가 임계값 미만인가
  matchRateBelowThreshold(context) {
    const threshold = context.config?.pdca?.matchRateThreshold ?? 90;
    return context.matchRate !== null && context.matchRate < threshold;
  },

  // check → report: matchRate가 임계값 이상인가
  matchRateAboveThreshold(context) {
    const threshold = context.config?.pdca?.matchRateThreshold ?? 90;
    return context.matchRate !== null && context.matchRate >= threshold;
  },

  // act → check: 반복 횟수가 최대 미만인가
  iterationNotExceeded(context) {
    const max = context.config?.pdca?.maxIterations ?? 5;
    return (context.iterationCount || 0) < max;
  },

  // act → report: 반복 횟수가 최대에 도달했는가
  maxIterationsReached(context) {
    const max = context.config?.pdca?.maxIterations ?? 5;
    return (context.iterationCount || 0) >= max;
  },

  // report → archived: Report 문서가 존재하는가
  reportCompleted(context) {
    const docPath = path.join(
      context.projectRoot,
      'docs', '04-report', `${context.featureName}.report.md`
    );
    return fs.existsSync(docPath);
  },

  // discovery → plan: CPS 문서가 존재하는가
  discoveryComplete(context) {
    const docPath = path.join(
      context.projectRoot,
      'docs', '00-discovery', `${context.featureName}.cps.md`
    );
    return fs.existsSync(docPath);
  },

  // do → check: Smoke Test가 통과했는가 (build + dev 서버 기동)
  smokeTestPassed(context) {
    return context.smokeTestResult === true;
  },

  // any → cancelled: 사용자가 취소를 확인했는가
  userConfirmedCancel(context) {
    return context.cancelConfirmed === true;
  },
};

/**
 * 가드 이름으로 가드를 평가한다.
 */
function evaluateGuard(guardName, context) {
  const guard = guards[guardName];
  if (!guard) {
    throw new Error(`Unknown guard: "${guardName}"`);
  }
  return guard(context);
}

/**
 * 특정 전이의 가드를 찾아 평가한다.
 */
function evaluateTransitionGuard(fromPhase, toPhase, context, transitions) {
  const t = transitions.find((tr) => tr.from === fromPhase && tr.to === toPhase);
  if (!t) {
    return { allowed: false, reason: `No transition from "${fromPhase}" to "${toPhase}"` };
  }
  const result = evaluateGuard(t.guard, context);
  return {
    allowed: result,
    guard: t.guard,
    reason: result ? null : `Guard "${t.guard}" failed`,
  };
}

module.exports = {
  guards,
  evaluateGuard,
  evaluateTransitionGuard,
};
