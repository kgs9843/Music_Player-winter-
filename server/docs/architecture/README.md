# 아키텍처 (맵)

## 목표

- 에이전트·사람 모두 **예측 가능한 구조**에서 빠르게 변경한다.

### 📋 Agent Context: Node.js MVC Architecture Guidance

**1. 아키텍처 개요 (Overview)**
사용자는 Node.js 환경에서 **MVC (Model-View-Controller)** 패턴을 적용하여 프로젝트를 구조화하고자 함. 이 패턴의 주 목적은 관심사 분리(Separation of Concerns)를 통해 코드의 가독성과 유지보수성을 높이는 것임.

**2. 구성 요소별 역할 지침 (Component Responsibilities)**
에이전트는 다음 구조에 따라 코드를 생성하거나 조언해야 함:

- **Model (데이터/로직):**
  - 데이터베이스와의 상호작용(CRUD) 및 데이터 가공 로직을 담당.
  - 데이터 구조를 정의하고 이를 `module.exports`를 통해 컨트롤러에 전달.
  - 예: `User.js`에서 원시 데이터를 객체 배열 형태로 가공하여 내보냄.
- **View (인터페이스):**
  - 사용자에게 보여지는 화면(UI)을 담당. 주로 EJS와 같은 템플릿 엔진을 사용.
  - 컨트롤러로부터 전달받은 데이터를 화면에 렌더링하며, 클라이언트 사이드 스크립트(Axios 등)를 포함할 수 있음.
- **Controller (중재자):**
  - 모든 흐름의 중심. 라우터와 모델, 뷰를 연결함.
  - 라우터로부터 요청을 받아 모델에서 데이터를 가져오거나 가공하고, 그 결과를 뷰에 전달(`res.render`)하거나 클라이언트에 응답(`res.send`).
- **Router (경로 제어):**
  - URL 경로에 따라 적절한 컨트롤러 함수를 매핑.
  - `express.Router()`를 활용하여 경로별로 모듈화하여 관리.

**3. 프로젝트 구조 및 흐름 표준 (Workflow Standard)**
에이전트는 코드 작성 시 아래의 흐름을 준수할 것:

1.  **Entry Point (`index.js`):** Express 설정 및 라우터 미들웨어 등록.
2.  **Routing:** `routes/` 폴더 내에서 경로 정의 및 컨트롤러 연결.
3.  **Logic Handling:** `controller/` 폴더 내에서 비즈니스 로직 수행 및 모델 호출.
4.  **Data Management:** `model/` 폴더 내에서 데이터 처리 로직 수행.

**4. 기술적 세부 사항 (Implementation Details)**

- **모듈화:** `module.exports`와 `require`를 사용하여 파일 간 의존성을 명확히 분리할 것.
- **비동기 처리:** 데이터베이스 연산이나 가공 시 적절한 비동기 패턴(Optional: Promise/Async-Await)을 고려할 것.
- **오류 방지:** 반복문(for, forEach 등) 내에서 조건부 로직(if-else) 사용 시, 데이터 비교가 완료된 후 최종 응답을 보내도록 설계할 것.

**5. 답변 스타일 가이드**

- 단순 기능 구현보다는 "어떤 파일이 어떤 역할을 해야 하는지" 폴더 구조와 함께 설명할 것.
- 사용자가 제공한 레퍼런스(Velog)의 예시(로그인 로직, 데이터 가공 과정 등)를 인지하고 유사한 논리 구조로 답변할 것.
