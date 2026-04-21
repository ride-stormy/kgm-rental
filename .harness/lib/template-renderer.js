/**
 * Harness Engine — 문서 템플릿 렌더러
 *
 * 마크다운 템플릿의 변수({{variable}})를 실제 값으로 치환하여
 * 완성된 문서를 생성한다.
 *
 * 문법:
 *   {{variable}}              → 단순 변수 치환
 *   {{#if condition}}...{{/if}} → 조건부 섹션
 *   {{#each items}}...{{/each}} → 반복 섹션 ({{this}} 또는 {{this.key}})
 *   {{date}}                  → 현재 날짜 (자동)
 *   {{time}}                  → 현재 시간 (자동)
 */

const fs = require('fs');
const path = require('path');

/**
 * 템플릿을 렌더링한다.
 *
 * @param {string} templateContent - 템플릿 문자열
 * @param {object} variables - 치환할 변수 객체
 * @returns {string} 렌더링된 문서
 */
function render(templateContent, variables) {
  // 자동 변수 추가
  const now = new Date();
  const vars = {
    date: now.toISOString().split('T')[0],
    time: now.toTimeString().split(' ')[0],
    year: now.getFullYear().toString(),
    ...variables,
  };

  let result = templateContent;

  // 1. {{#each items}}...{{/each}} 처리
  result = result.replace(
    /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
    (match, key, body) => {
      const items = vars[key];
      if (!Array.isArray(items) || items.length === 0) return '';
      return items
        .map((item) => {
          let rendered = body;
          if (typeof item === 'object') {
            Object.entries(item).forEach(([k, v]) => {
              rendered = rendered.replace(new RegExp(`\\{\\{this\\.${k}\\}\\}`, 'g'), v ?? '');
            });
          }
          rendered = rendered.replace(/\{\{this\}\}/g, String(item));
          return rendered;
        })
        .join('');
    }
  );

  // 2. {{#if condition}}...{{/if}} 처리
  result = result.replace(
    /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (match, key, body) => {
      return vars[key] ? body : '';
    }
  );

  // 3. {{variable}} 단순 치환
  result = result.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, key) => {
    const keys = key.split('.');
    let value = vars;
    for (const k of keys) {
      if (value == null) return match;
      value = value[k];
    }
    return value != null ? String(value) : match;
  });

  return result;
}

/**
 * 템플릿 파일을 읽어 렌더링한다.
 */
function renderFile(templatePath, variables) {
  const content = fs.readFileSync(templatePath, 'utf-8');
  return render(content, variables);
}

/**
 * 템플릿에서 필요한 변수 목록을 추출한다.
 */
function extractVariables(templateContent) {
  const variables = new Set();
  const regex = /\{\{(?:#(?:if|each)\s+)?(\w+(?:\.\w+)*)\}\}/g;
  let match;
  while ((match = regex.exec(templateContent)) !== null) {
    const name = match[1];
    if (!['if', 'each', 'this'].includes(name)) {
      variables.add(name);
    }
  }
  return Array.from(variables);
}

/**
 * 템플릿 문법이 올바른지 검증한다.
 */
function validateTemplate(templateContent) {
  const errors = [];

  // #if / /if 짝 확인
  const ifOpens = (templateContent.match(/\{\{#if\s+/g) || []).length;
  const ifCloses = (templateContent.match(/\{\{\/if\}\}/g) || []).length;
  if (ifOpens !== ifCloses) {
    errors.push(`if 블록 불일치: 열림 ${ifOpens}개, 닫힘 ${ifCloses}개`);
  }

  // #each / /each 짝 확인
  const eachOpens = (templateContent.match(/\{\{#each\s+/g) || []).length;
  const eachCloses = (templateContent.match(/\{\{\/each\}\}/g) || []).length;
  if (eachOpens !== eachCloses) {
    errors.push(`each 블록 불일치: 열림 ${eachOpens}개, 닫힘 ${eachCloses}개`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = {
  render,
  renderFile,
  extractVariables,
  validateTemplate,
};
