# 아키텍처 (맵)

## 목표

- 에이전트·사람 모두 **예측 가능한 구조**에서 빠르게 변경한다.
- 문서만으로 유지가 어려운 규칙은 **린트·테스트·CI**로 옮긴다 (`npm run verify`, ESLint 등).

## Feature-Sliced Design (FSD)

이 레포는 **FSD 아이디어**를 따른다. 레이어 간 **import 방향**과 슬라이스 안의 `ui` / `model` / `api` 규칙은 아래가 **기계적으로 적용되는 SoT**다.

- **불변 규칙(짧게, 에이전트 항시 적용)**: `.cursor/rules/fsd-core.mdc`
- **슬라이스 스캐폴드·체크리스트**: `.cursor/skills/fsd-slices/SKILL.md`

여기(`docs/architecture`)에는 **배경·현재 트리·운영 관점**만 둔다. 표나 “누가 누구를 import할 수 있는지”는 `fsd-core.mdc`를 수정할 때 이 문서의 “현재 트리”와 함께 맞추면 된다.
