/**
 * Harness Engine — 체크포인트 관리
 *
 * 각 상태 전이 시 현재 상태를 스냅샷으로 저장.
 * 문제 발생 시 이전 상태로 롤백 가능.
 *
 * 경로: {project}/.harness/checkpoints/{feature}-{phase}-{timestamp}.json
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function getCheckpointsDir(projectRoot) {
  return path.join(projectRoot, '.harness', 'checkpoints');
}

/**
 * 파일의 해시를 계산한다 (문서 변경 감지용).
 */
function fileHash(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf-8');
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * 현재 상태의 체크포인트를 생성한다.
 *
 * @param {string} projectRoot - 프로젝트 루트 경로
 * @param {string} featureName - 피처 이름
 * @param {object} featureState - 현재 피처 상태 객체
 * @returns {object} 생성된 체크포인트 정보
 */
function createCheckpoint(projectRoot, featureName, featureState) {
  const dir = getCheckpointsDir(projectRoot);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!/^[a-z0-9-]+$/.test(featureName)) {
    throw new Error(`Invalid featureName: "${featureName}". Only lowercase letters, digits, and hyphens are allowed.`);
  }

  const timestamp = Date.now();
  const phase = featureState.phase ?? 'unknown';
  const filename = `${featureName}-${phase}-${timestamp}.json`;
  const filePath = path.join(dir, filename);

  // 관련 문서의 해시 수집
  const documents = {};
  const docPaths = {
    plan: path.join(projectRoot, 'docs', '01-plan', 'features', `${featureName}.plan.md`),
    design: path.join(projectRoot, 'docs', '02-design', 'features', `${featureName}.design.md`),
    analysis: path.join(projectRoot, 'docs', '03-analysis', `${featureName}.analysis.md`),
    report: path.join(projectRoot, 'docs', '04-report', `${featureName}.report.md`),
  };

  for (const [key, docPath] of Object.entries(docPaths)) {
    const hash = fileHash(docPath);
    if (hash) {
      documents[key] = { path: docPath, hash };
    }
  }

  const checkpoint = {
    feature: featureName,
    phase,
    timestamp: new Date(timestamp).toISOString(),
    state: JSON.parse(JSON.stringify(featureState)),
    documents,
  };

  fs.writeFileSync(filePath, JSON.stringify(checkpoint, null, 2), 'utf-8');

  return {
    filename,
    path: filePath,
    phase,
    timestamp: checkpoint.timestamp,
  };
}

/**
 * 피처의 체크포인트 목록을 반환한다.
 */
function listCheckpoints(projectRoot, featureName) {
  const dir = getCheckpointsDir(projectRoot);
  if (!fs.existsSync(dir)) return [];

  const prefix = `${featureName}-`;
  return fs.readdirSync(dir)
    .filter((f) => f.startsWith(prefix) && f.endsWith('.json'))
    .sort()
    .map((filename) => {
      const content = JSON.parse(fs.readFileSync(path.join(dir, filename), 'utf-8'));
      return {
        filename,
        phase: content.phase,
        timestamp: content.timestamp,
        documentsCount: Object.keys(content.documents).length,
      };
    });
}

/**
 * 특정 체크포인트로 상태를 복원한다.
 *
 * @param {string} projectRoot - 프로젝트 루트 경로
 * @param {string} checkpointFilename - 체크포인트 파일명
 * @returns {object} 복원된 상태
 */
function restoreCheckpoint(projectRoot, checkpointFilename) {
  const dir = getCheckpointsDir(projectRoot);
  const filePath = path.join(dir, checkpointFilename);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Checkpoint not found: ${checkpointFilename}`);
  }

  const checkpoint = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return checkpoint.state;
}

/**
 * 오래된 체크포인트를 정리한다.
 *
 * @param {string} projectRoot - 프로젝트 루트 경로
 * @param {string} featureName - 피처 이름
 * @param {number} [keepCount=5] - 유지할 최근 체크포인트 수
 * @returns {number} 삭제된 체크포인트 수
 */
function pruneCheckpoints(projectRoot, featureName, keepCount) {
  const keep = keepCount ?? 5;
  const checkpoints = listCheckpoints(projectRoot, featureName);

  if (checkpoints.length <= keep) return 0;

  const toDelete = checkpoints.slice(0, checkpoints.length - keep);
  const dir = getCheckpointsDir(projectRoot);

  for (const cp of toDelete) {
    fs.unlinkSync(path.join(dir, cp.filename));
  }

  return toDelete.length;
}

module.exports = {
  createCheckpoint,
  listCheckpoints,
  restoreCheckpoint,
  pruneCheckpoints,
  getCheckpointsDir,
};
