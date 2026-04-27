# AGENTS.md — SnowGlow 작업 지도

이 문서는 **SnowGlow(server)** 작업 시 “무엇을 어디서 보면 되는지”와 “어떤 기준으로 구조를 바꿔야 하는지”만 담습니다.

- **로컬에서 실행하는 흐름**만 기록합니다.
- 서버 구조를 변경/추가/이동할 때는 아래 **SoT 문서**를 **먼저 읽고**, 그 기준을 따릅니다.

---

## SoT(단일 진실) 문서

- `docs/index.md`: `docs/` 전체 목차
- `docs/architecture/README.md`: **MVC 아키텍처 기준(Entry → Routes → Controllers → Services/Models)**
  - 라우팅은 `routes/`에서만 정의
  - 요청/응답 중재는 `controllers/`
  - 변환(yt-dlp) 같은 로직은 `services/`
  - 상태/데이터는 `models/` (현재는 in-memory store)

---
