/**
 * Harness Engine — Eval Reporter
 *
 * eval 결과를 마크다운 형식으로 포맷팅한다.
 */

/**
 * eval 결과를 마크다운 테이블 형식으로 포맷한다.
 *
 * @param {object} result - runEval() 반환값
 * @returns {string} 마크다운 문자열
 */
function formatResult(result) {
  const lines = [];
  lines.push(`## Eval: ${result.name}`);
  lines.push('');
  lines.push('| Perspective | Score | Weight | Weighted |');
  lines.push('|-------------|-------|--------|----------|');

  if (result.scores && result.scores.length > 0) {
    for (const s of result.scores) {
      lines.push(`| ${s.name} | ${s.score} | ${s.weight} | ${s.weighted} |`);
    }
  }

  lines.push('');
  const status = result.passed ? 'PASSED' : 'FAILED';
  const icon = result.passed ? '\u2713' : '\u2717';
  lines.push(`**Total: ${result.totalScore} / 100** ${icon} ${status}`);

  return lines.join('\n');
}

/**
 * 두 eval 결과를 비교하는 마크다운 테이블을 생성한다.
 *
 * @param {object} resultA - 첫 번째 결과
 * @param {object} resultB - 두 번째 결과
 * @returns {string} 마크다운 문자열
 */
function compareResults(resultA, resultB) {
  const lines = [];
  lines.push(`## Comparison: ${resultA.name} vs ${resultB.name}`);
  lines.push('');
  lines.push('| Perspective | A | B | \u0394 |');
  lines.push('|-------------|---|---|---|');

  const scoresA = resultA.scores || [];
  const scoresB = resultB.scores || [];

  // 모든 perspective를 합집합으로 수집
  const allIds = new Set();
  for (const s of scoresA) allIds.add(s.perspectiveId);
  for (const s of scoresB) allIds.add(s.perspectiveId);

  for (const id of allIds) {
    const a = scoresA.find((s) => s.perspectiveId === id);
    const b = scoresB.find((s) => s.perspectiveId === id);
    const scoreA = a ? a.score : 0;
    const scoreB = b ? b.score : 0;
    const delta = Math.round((scoreB - scoreA) * 10) / 10;
    const name = (a && a.name) || (b && b.name) || id;
    const deltaStr = delta >= 0 ? `+${delta}` : `${delta}`;
    lines.push(`| ${name} | ${scoreA} | ${scoreB} | ${deltaStr} |`);
  }

  lines.push('');
  const deltaTotal = Math.round((resultB.totalScore - resultA.totalScore) * 10) / 10;
  const deltaTotalStr = deltaTotal >= 0 ? `+${deltaTotal}` : `${deltaTotal}`;
  lines.push(`**Total: ${resultA.totalScore} vs ${resultB.totalScore} (${deltaTotalStr})**`);

  return lines.join('\n');
}

module.exports = { formatResult, compareResults };
