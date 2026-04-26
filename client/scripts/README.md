# scripts/

이 폴더는 **OS에 상관없이 동일한 검증 게이트**를 돌리기 위한 스크립트를 둡니다.

## 핵심: 검증 게이트

- **로컬/CI 공통**: `npm run verify`
  - 내부적으로 `node scripts/verify-task.mjs` 실행
  - 실행 순서: `lint` → `format:check` → `type-check` → `build` → (FSD 규칙 일부 체크)

## 파일

- `verify-task.mjs`
  - Node만으로 동작하는 크로스플랫폼 검증 엔트리입니다.
  - `--precommit` 모드에서는 전역 `prettier --check`를 생략할 수 있습니다.
- `verify-task.sh`
  - POSIX 환경에서 `verify-task.mjs`를 실행하는 얇은 래퍼입니다.
