# docs/ (기록 시스템)

이 디렉터리는 프로젝트 지식의 **기록 시스템(SoT)** 입니다. 에이전트/사람 모두 여기의 문서를 기준으로 추론합니다.

## 목차

- `docs/architecture/README.md`: FSD 배경, **실제 `src/` 트리**, 규칙은 `fsd-core.mdc`로 링크
- `docs/product/README.md`: **SnowGlow** 한 줄, 사용자 여정, 용어, 수용 기준 요약
- `docs/design/README.md`: UI/디자인 — **`design-system.md`가 SoT** (`.cursor/rules/design.mdc`와 동일 내용 축)
- `docs/references/README.md`: 외부 문서/근거 고정(예: Context7 조회 결과)

에이전트용 한 페이지 지도는 루트 **`AGENTS.md`**(문서 목차 표 포함)를 병행합니다.

## 운영 원칙(짧게)

- 큰 만능 문서 1개로 모든 걸 해결하지 않습니다. 문서는 **짧고 링크 중심**으로 유지합니다.
- 외부에만 존재하는 지식은 없는 것으로 취급합니다. 결정/규칙/제약은 **반드시 레포에 버전관리**합니다.
- 반복적으로 깨지는 규칙은 문서가 아니라 **린트/테스트/CI**로 승격합니다.
