# for-hobom-backend

Backend system for the HoBom project, built with NestJS and TypeScript following Hexagonal Architecture principles.

## 🚀 Features

- Modular architecture with clear boundaries
- RESTful API using NestJS
- MongoDB integration via Mongoose
- Daily todo management like `TODO MATES`
- Comprehensive unit and integration testing with Jest
- Swagger-based API documentation
- GitHub Actions for CI/CD

## 🛠️ Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: MongoDB
- **ODM**: Mongoose
- **Testing**: Jest
- **API Docs**: Swagger
- **CI/CD**: GitHub Actions

## 📦 Installation

```bash
npm install
```

## ▶️ Running App
```bash
npm run start:dev
```

## 🧪 Running Tests
```bash
npm run test
```

## 📚 API Documentation
```bash
http://localhost:8080/api-docs
```

---

## 아키텍처

Hexagonal Architecture (Ports & Adapters) 패턴을 적용한다.

각 도메인 모듈 구조:
```
{domain}/
├── domain/
│   ├── model/       # Entity, Value Object, Repository 인터페이스
│   └── ports/
│       ├── in/      # Input Port (Use Case 인터페이스)
│       └── out/     # Output Port (Command, 외부 의존성 인터페이스)
├── application/     # Use Case 구현체 (Service)
├── adapters/
│   ├── in/          # HTTP Controller, gRPC Controller
│   └── out/         # Persistence/Query Adapter
└── infra/           # Repository 구현체 (Mongoose)
```

---

## ADR: gRPC 선택 이유

### 결정

외부 클라이언트(앱/웹)는 **REST(포트 8080)**, 내부 서비스 간 통신은 **gRPC(포트 50051)**를 사용한다.

### 배경

이 서비스는 **Transactional Outbox 패턴**을 구현한다. 모든 상태 변경 이벤트는 `outbox` 컬렉션에 PENDING 상태로 기록되고, 별도의 consumer 서비스들이 이를 처리한다.

```
[REST Client (앱/웹)]
        ↓ HTTP (8080)
[hobom-backend]
  → outbox 컬렉션에 이벤트 저장 (PENDING)
        ↑ gRPC (50051)
[Consumer Services]
  - FindOutboxByEventTypeAndStatus: pending 이벤트 polling
  - PatchOutboxMarkAsSent: 처리 완료 후 SENT로 갱신
```

### gRPC를 선택한 이유

**1. 강타입 계약 (Contract-First)**

Protocol Buffers(`.proto` 파일)가 명시적 인터페이스 계약서 역할을 한다. 서버와 모든 consumer가 동일한 `hobom-buf-proto` git submodule을 참조하므로 스키마 변경 시 컴파일 타임에 불일치를 감지할 수 있다.

REST를 사용하면 계약이 암묵적이 되어 내부 서비스 간 런타임 에러가 발생하기 쉽다.

**2. 성능**

JSON 대비 Protocol Buffers 바이너리 인코딩은 payload 크기가 작다. outbox polling처럼 주기적으로 대량의 레코드를 조회하는 패턴에서 효율적이다.

**3. 코드 생성**

proto 파일로부터 클라이언트/서버 코드가 자동 생성되어 타입 안전성이 보장된다.

### 대안과 기각 이유

| 대안 | 기각 이유 |
|------|-----------|
| REST (내부) | 계약이 암묵적, 버전 관리 어려움 |
| Message Queue (Kafka 등) | 현재 규모에서 인프라 복잡도 과다 |

### proto 파일 위치

`hobom-buf-proto/` (git submodule)에서 관리한다.
