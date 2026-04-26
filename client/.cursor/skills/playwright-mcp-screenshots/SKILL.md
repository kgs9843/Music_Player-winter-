---
name: playwright-mcp-screenshots
description: >-
  Captures real browser screenshots for PRs or docs using the Playwright MCP the
  user has enabled in Cursor. Use when the user mentions Playwright MCP,
  browser screenshot automation, PR template screenshots (스크린샷), UI capture
  for documentation, or wants the agent to save PNGs into the repo after
  navigating the local dev app.
---

# Playwright MCP — UI 스크린샷 (Photo Guard)

## When to apply

- 레포에서 **`npm run test:e2e`**(`e2e/*.spec.ts`)로 같은 PNG를 재현할 수 있으면 **CLI를 우선**하고, MCP는 보조·수동 시나리오에 쓴다. ([`AGENTS.md`](../../../AGENTS.md) — Playwright E2E)
- PR 본문 [`docs/workflows/pull-request-template.md`](../../../docs/workflows/pull-request-template.md)의 **스크린샷** 섹션을 채우거나, 변경 UI를 **실제 브라우저**로 보여줄 때.
- 사용자가 **Playwright MCP**, **브라우저 스크린샷**, **MCP로 찍어** 등을 말할 때.
- 문서·리뷰용으로 **레포 안에 PNG**를 남겨야 할 때 (`docs/references/…` 등).

## Hard requirements

1. **MCP 도구를 호출하기 전에** Cursor에 등록된 **Playwright MCP 서버의 도구 이름·인자**를 확인한다.  
   (`call_mcp_tool` 사용 시 **반드시 해당 서버의 tool 스키마/디스크립터를 먼저 읽는다.** 서버 id는 환경마다 다를 수 있다 — `playwright`, `browser`, 사용자 정의 이름 등.)
2. **로컬 앱 URL**이 필요하다. 이 프로젝트는 Vite 기본이 **`http://localhost:5173`** (다르면 사용자·`vite.config`·실행 중 터미널 로그로 확인).
3. 스크린샷 **저장 경로는 워크스페이스 안**으로만 한다. 권장:
   - `docs/references/screenshots/<짧은-설명-kebab>/` (예: `cleaning-success-2026/`)
   - 또는 `docs/workflows/pr-screenshots/<branch-slug>/`
4. PR 본문에는 마크다운으로 이미지 링크를 넣는다. 예: `![설명](./docs/references/screenshots/foo/cleaning.png)` (경로는 저장 위치에 맞게 조정).

## Agent workflow

1. **서버 준비**
   - 앱이 필요하면 저장소 루트에서 **`npm run dev`** 를 백그라운드로 띄우고, 터미널 로그로 **ready + URL·포트**를 확인한다.
   - 이미 dev가 떠 있으면 그 URL을 쓴다.

2. **MCP 스키마**
   - Playwright MCP에 붙어 있는 **navigation / screenshot / click** 류 도구의 **정확한 이름과 필수 인자**를 스키마에서 확인한 뒤 한 번에 한 단계씩 호출한다.
   - 추측으로 URL·파일 경로 필드명을 바꾸지 않는다.

3. **캡처 시나리오**
   - 변경과 관련된 **라우트**로 이동한다 (예: `/clean`, `/cleaning`). React Router이므로 **풀 URL**을 사용한다.
   - 필요하면 로컬스토리지·선택 플로우가 있어 **직접 재현이 어려우면** 사용자에게 “이 화면까지 클릭해 두면 찍겠다”고 짧게 요청한다.

4. **저장**
   - PNG(또는 MCP가 지원하는 형식)를 **위 권장 디렉터리**에 저장한다.
   - 파일명은 영문 kebab, 한 PR/기능 단위로 폴더를 나눈다.

5. **PR 본문·기록**
   - `pr-body.local.md` 또는 PR 설명에 **스크린샷 섹션**에 경로·한 줄 설명을 넣는다.
   - 이미지는 **커밋**되어야 GitHub에서 렌더된다.

## If MCP or dev server fails

- MCP가 없거나 오류면: 스킬을 **적용하지 않고** [`pull-request-template.md`](../../../docs/workflows/pull-request-template.md)에 적어 둔 대로 **사람 캡처** 또는 **Playwright CLI 스크립트(레포에 별도 추가)** 안내로 돌아간다.
- 헤드리스/샌드박스에서 로컬호스트에 닿지 않으면: **사용자 머신에서** MCP가 붙는지 확인하도록 안내한다.

## Do not

- MCP 없이 “스크린샷 찍었다”고 **가짜 이미지**를 만들지 않는다 (`GenerateImage`로 UI 위장 금지).
- 프로덕션 URL·개인 계정 로그인이 필요한 흐름을 **자동으로** 밀어 넣지 않는다(스코프 밖이면 중단).
