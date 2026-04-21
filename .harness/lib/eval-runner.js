/**
 * Harness Engine — Eval Runner
 *
 * eval 정의(evals/*.eval.json)를 로드하고 실행한다.
 * context 기반으로 perspectives 점수를 계산하여 pass/fail을 판정.
 */

const fs = require('fs');
const path = require('path');

/**
 * evals 디렉토리 경로를 반환한다.
 */
function getEvalsDir() {
  return path.join(__dirname, '..', 'evals');
}

function readEvalDefinition(filePath) {
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (!content || typeof content !== 'object') return null;
    if (!content.id || !content.name || !Array.isArray(content.perspectives)) return null;
    if (typeof content.threshold !== 'number') return null;
    return content;
  } catch (_) {
    return null;
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * evals 디렉토리의 유효한 정의 목록을 반환하는 내부 헬퍼.
 * @returns {object[]}
 */
function loadAllEvalDefs() {
  const evalsDir = getEvalsDir();
  if (!fs.existsSync(evalsDir)) return [];
  return fs.readdirSync(evalsDir)
    .filter((f) => f.endsWith('.eval.json'))
    .map((f) => readEvalDefinition(path.join(evalsDir, f)))
    .filter(Boolean);
}

/**
 * eval ID 목록을 반환한다.
 * @returns {string[]}
 */
function listEvals() {
  return loadAllEvalDefs().map((d) => d.id);
}

/**
 * eval 정의를 반환한다.
 * @param {string} evalId
 * @returns {object|null}
 */
function getEval(evalId) {
  return loadAllEvalDefs().find((d) => d.id === evalId) || null;
}

/**
 * perspective별 점수를 계산한다.
 *
 * @param {object} perspective - perspective 정의
 * @param {object} context - 실행 컨텍스트
 * @returns {number} 0-100 점수
 */
function calculatePerspectiveScore(perspective, context) {
  const matchRate = clamp(Number(context.matchRate) || 0, 0, 100);
  const iterationCount = Math.max(1, Number(context.iterationCount) || 1);

  switch (perspective.id) {
    case 'completeness':
      return matchRate >= 90 ? 100 : matchRate;
    case 'quality':
      return matchRate;
    case 'process':
      return iterationCount <= 3 ? 100 : Math.max(0, 100 - (iterationCount - 3) * 10);
    default:
      return matchRate;
  }
}

/**
 * eval을 실행한다.
 *
 * @param {string} evalId - eval ID
 * @param {object} context - { projectRoot, featureName, matchRate, iterationCount }
 * @returns {object} { evalId, name, scores, totalScore, passed, timestamp }
 */
function runEval(evalId, context) {
  const evalDef = getEval(evalId);
  if (!evalDef) {
    throw new Error(`Eval not found: ${evalId}`);
  }

  const scores = evalDef.perspectives.map((p) => {
    const score = calculatePerspectiveScore(p, context);
    return {
      perspectiveId: p.id,
      name: p.name,
      score: score,
      weight: p.weight,
      weighted: Math.round(score * p.weight * 10) / 10,
    };
  });

  const totalScore = Math.round(scores.reduce((sum, s) => sum + s.weighted, 0) * 10) / 10;
  const passed = totalScore >= evalDef.threshold;
  const timestamp = new Date().toISOString();

  const result = {
    evalId,
    name: evalDef.name,
    scores,
    totalScore,
    passed,
    timestamp,
  };

  // 결과를 .harness/evals/{evalId}/latest.json에 저장
  if (context.projectRoot) {
    const resultDir = path.join(context.projectRoot, '.harness', 'evals', evalId);
    fs.mkdirSync(resultDir, { recursive: true });
    fs.writeFileSync(
      path.join(resultDir, 'latest.json'),
      JSON.stringify(result, null, 2),
      'utf-8'
    );
  }

  return result;
}

/**
 * 저장된 eval 결과를 로드한다.
 *
 * @param {string} evalId - eval ID
 * @param {string} projectRoot - 프로젝트 루트 경로
 * @returns {object|null} eval 결과 객체, 없으면 null
 */
function getEvalResult(evalId, projectRoot) {
  const filePath = path.join(projectRoot, '.harness', 'evals', evalId, 'latest.json');
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

module.exports = { listEvals, getEval, runEval, getEvalResult };
