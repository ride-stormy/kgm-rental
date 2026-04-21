/**
 * Harness Engine — 아카이버
 *
 * 완료된 Feature/Epic의 PDCA 문서를 docs/archive/YYYY-MM/{name}/으로 이동하고
 * 상태 파일을 경량 요약으로 축소한다.
 */

const fs = require('fs');
const path = require('path');
const audit = require('./audit-logger');
const sm = require('./state-machine');

// PDCA 문서 경로 (checkpoint.js:52-57 패턴 동일)
const DOC_PATHS = {
  plan:     (root, name) => path.join(root, 'docs', '01-plan', 'features', `${name}.plan.md`),
  design:   (root, name) => path.join(root, 'docs', '02-design', 'features', `${name}.design.md`),
  analysis: (root, name) => path.join(root, 'docs', '03-analysis', `${name}.analysis.md`),
  report:   (root, name) => path.join(root, 'docs', '04-report', `${name}.report.md`),
};

const EPIC_DOC_PATHS = {
  plan:   (root, name) => path.join(root, 'docs', '01-plan', `${name}.plan.md`),
  report: (root, name) => path.join(root, 'docs', '04-report', `${name}.epic-report.md`),
};

/**
 * archive 대상 경로를 계산한다.
 * @returns {string} docs/archive/YYYY-MM/{name}/
 */
function getArchivePath(projectRoot, name) {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return path.join(projectRoot, 'docs', 'archive', month, name);
}

/**
 * docs/archive/YYYY-MM/_INDEX.md를 생성하거나 행을 추가한다.
 */
function generateIndex(projectRoot, archiveDir, name, movedDocs) {
  const indexPath = path.join(path.dirname(archiveDir), '_INDEX.md');
  const today = new Date().toISOString().split('T')[0];
  const docList = movedDocs.join(', ');

  if (!fs.existsSync(indexPath)) {
    const month = path.basename(path.dirname(archiveDir));
    const header =
      `# Archive - ${month}\n\n` +
      `| Feature | Archived Date | Documents |\n` +
      `|---------|---------------|-----------|\n`;
    fs.writeFileSync(indexPath, header, 'utf-8');
  }

  const row = `| ${name} | ${today} | ${docList} |\n`;
  fs.appendFileSync(indexPath, row, 'utf-8');
}

/**
 * Feature의 PDCA 문서 4종을 archive 폴더로 이동하고 상태를 정리한다.
 *
 * @param {string} projectRoot
 * @param {string} featureName
 * @throws {Error} report 미완료 또는 필수 문서 누락 시
 */
function archiveFeature(projectRoot, featureName) {
  const featureState = sm.readFeatureState(projectRoot, featureName);
  if (!featureState) {
    throw new Error(`Feature "${featureName}" 상태를 찾을 수 없습니다.`);
  }

  if (featureState.phase !== 'report') {
    throw new Error(
      `archive는 report 단계에서만 실행 가능합니다. 현재 단계: ${featureState.phase}`
    );
  }

  // 필수 문서 확인 (plan, design은 필수 / analysis, report는 있으면 이동)
  const required = ['plan', 'design'];
  for (const key of required) {
    const docPath = DOC_PATHS[key](projectRoot, featureName);
    if (!fs.existsSync(docPath)) {
      throw new Error(`필수 문서가 없습니다: ${docPath}`);
    }
  }

  const archiveDir = getArchivePath(projectRoot, featureName);
  fs.mkdirSync(archiveDir, { recursive: true });

  // 문서 이동 (fs.renameSync: 원본 삭제)
  const movedDocs = [];
  for (const [key, pathFn] of Object.entries(DOC_PATHS)) {
    const src = pathFn(projectRoot, featureName);
    if (fs.existsSync(src)) {
      const dest = path.join(archiveDir, path.basename(src));
      fs.renameSync(src, dest);
      movedDocs.push(key);
    }
  }

  // _INDEX.md 업데이트
  generateIndex(projectRoot, archiveDir, featureName, movedDocs);

  // 상태 전이: report → archived
  sm.transition(projectRoot, featureName, 'archived', { archivedTo: archiveDir });

  // harness.json 경량 요약으로 축소
  sm.summarizeArchivedFeature(projectRoot, featureName, archiveDir);

  // Epic 소속이면 동기화
  if (featureState.epic) {
    sm.syncEpicStatus(projectRoot, featureState.epic);
  }

  audit.log(projectRoot, {
    event: 'feature_archived',
    feature: featureName,
    data: {
      archivedTo: archiveDir,
      movedDocs,
      matchRate: featureState.matchRate,
      iterationCount: featureState.iterationCount,
    },
  });

  return { archiveDir, movedDocs };
}

/**
 * Epic의 문서를 archive 폴더로 이동하고 Epic 상태를 완료 처리한다.
 * 모든 Feature가 archived/cancelled 상태일 때 호출한다.
 *
 * @param {string} projectRoot
 * @param {string} epicName
 */
function archiveEpic(projectRoot, epicName) {
  const epicState = sm.readEpicState(projectRoot, epicName);
  if (!epicState) {
    throw new Error(`Epic "${epicName}" 상태를 찾을 수 없습니다.`);
  }

  // 모든 Feature가 완료 상태인지 검증
  const incomplete = (epicState.features || []).filter(
    (f) => f.status !== 'completed' && f.status !== 'cancelled'
  );
  if (incomplete.length > 0) {
    throw new Error(
      `아직 완료되지 않은 Feature가 있습니다: ${incomplete.map((f) => f.name).join(', ')}`
    );
  }

  const archiveDir = getArchivePath(projectRoot, epicName);
  fs.mkdirSync(archiveDir, { recursive: true });

  const movedDocs = [];
  for (const [key, pathFn] of Object.entries(EPIC_DOC_PATHS)) {
    const src = pathFn(projectRoot, epicName);
    if (fs.existsSync(src)) {
      const dest = path.join(archiveDir, path.basename(src));
      fs.renameSync(src, dest);
      movedDocs.push(key);
    }
  }

  if (movedDocs.length > 0) {
    generateIndex(projectRoot, archiveDir, `${epicName} (epic)`, movedDocs);
  }

  // Epic 상태 완료 처리
  epicState.status = 'completed';
  epicState.archivedAt = new Date().toISOString();
  epicState.archivedTo = archiveDir;
  epicState.updatedAt = epicState.archivedAt;
  sm.writeEpicState(projectRoot, epicName, epicState);

  audit.log(projectRoot, {
    event: 'epic_archived',
    feature: epicName,
    data: { archivedTo: archiveDir, movedDocs },
  });

  return { archiveDir, movedDocs };
}

/**
 * harness.json에서 archived 상태인 feature 목록을 반환한다.
 */
function getArchivedFeatures(projectRoot) {
  const harness = sm.readHarnessState(projectRoot);
  if (!harness || !harness.features) return [];

  return Object.entries(harness.features)
    .filter(([, v]) => v.phase === 'archived')
    .map(([name, v]) => ({ name, ...v }));
}

/**
 * archived feature의 harness.json 항목과 state 파일을 정리한다.
 */
function cleanupArchived(projectRoot) {
  const archived = getArchivedFeatures(projectRoot);
  if (archived.length === 0) return { cleaned: [] };

  const harness = sm.readHarnessState(projectRoot);
  const cleaned = [];

  for (const feat of archived) {
    // harness.json에서 항목 삭제
    delete harness.features[feat.name];

    // .harness/state/features/{name}.state.json 삭제
    const statePath = sm.getFeatureStatePath(projectRoot, feat.name);
    if (fs.existsSync(statePath)) {
      fs.unlinkSync(statePath);
    }

    cleaned.push(feat.name);
  }

  sm.writeHarnessState(projectRoot, harness);

  audit.log(projectRoot, {
    event: 'archive_cleanup',
    feature: null,
    data: { cleaned },
  });

  return { cleaned };
}

module.exports = {
  archiveFeature,
  archiveEpic,
  getArchivePath,
  generateIndex,
  getArchivedFeatures,
  cleanupArchived,
};
