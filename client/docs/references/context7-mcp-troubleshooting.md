# Context7 MCP 문제 해결 메모 (2026-04-25)

## 목적

- 이 레포에서 “최신/공식 문서”를 **Context7 MCP로 조회**하고,
- 조회 결과(결론 3~7줄 + 링크)를 `docs/references/`에 고정하는 흐름을 만들기.

## 현재 관찰된 문제(이 환경)

- Context7 MCP 서버에는 도구가 있음:
  - `resolve-library-id`
  - `query-docs`
- 하지만 현재 Cursor 도구 호출 인터페이스에서 Context7 MCP를 호출할 때,
  **필수 인자(`query`, `libraryName`, `libraryId`)를 전달하지 못하는 형태**로 연결되어 호출이 실패함.
- 실패 형태: 입력 검증 에러(“expected string, received undefined”)가 발생.

즉 “Context7 자체가 고장”이라기보다 **MCP 호출 래퍼(인자 전달 경로) 문제**로 보임.

## 해결 방법(우선순위)

### 1) Cursor 업데이트/재시작

- Cursor를 최신 버전으로 업데이트 후 재시작
- MCP 서버 목록/설정이 다시 로드되며, 호출 래퍼가 정상화되는 경우가 있음

### 2) MCP 서버 재연결

- Cursor 설정에서 MCP 서버(Context7)를 비활성화/재활성화
- 혹은 MCP 관련 설정 파일을 재적용(환경에 따라 UI로 제공)

### 3) 도구 호출이 “arguments”를 받는지 확인

- 정상적인 MCP 호출은 보통:
  - `toolName`
  - `arguments`(JSON)
    형태를 지원해야 함.
- 만약 현재 환경이 `server/toolName`만 받는 형태라면, 그 상태에선 Context7를 사용할 수 없음.

### 4) 임시 우회(권장)

Context7가 막혀있을 때는 다음을 기본으로 사용하고, 결과를 `docs/references/`에 남긴다.

- 공식 문서 사이트(three.js, MDN, Vite, React Router 등) 직접 조회
- 링크 + 결론 3~7줄 + 적용 버전 + 조회일을 고정

## 체크리스트

- [ ] Cursor 최신 버전인가?
- [ ] MCP(Context7) 서버가 활성화되어 있고 인증이 필요한 경우 인증되어 있는가?
- [ ] MCP 도구 호출이 arguments(JSON)를 지원하는가?
- [ ] 안 되면 공식 문서 링크로 대체하고 `docs/references/`에 고정했는가?
