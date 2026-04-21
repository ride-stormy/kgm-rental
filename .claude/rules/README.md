# Rules

프로젝트 설정 후 `.claude/rules/`에 배치되는 도메인별 코딩 규칙 모음.

## 구조

| 디렉토리    | 설명                                                    |
| ----------- | ------------------------------------------------------- |
| `frontend/` | React/TypeScript 프론트엔드 구조·컨벤션 규칙 (4개 파일) |
| `backend/`  | NestJS DDD 4-Layer 백엔드 구조·컨벤션 규칙 (8개 파일)   |

## 작동 방식

Claude Code는 파일을 읽을 때 해당 파일 경로와 매칭되는 rule을 자동으로 로드한다.
각 rule 파일의 frontmatter `paths`에 적용 대상 glob 패턴이 정의되어 있다.

```yaml
# 예시: frontend/convention.md
---
paths:
  - "**/frontend/**/*.ts"
  - "**/frontend/**/*.tsx"
---
# 예시: backend/be-libs.md
---
paths:
  - "**/backend/libs/**/*.ts"
---
```

> 상세 내용은 각 디렉토리의 `README.md` 참조.
