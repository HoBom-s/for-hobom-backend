# Design Document: for-hobom-backend

## Overview

`for-hobom-backend`는 HoBom 생태계의 백엔드 시스템입니다. NestJS 11 + TypeScript 5.7 기반으로 개발되었으며, 헥사고날 아키텍처(Ports & Adapters)를 채택해 도메인 로직과 인프라 의존성을 명확하게 분리합니다.

사용자 관리, 일일 할 일(DailyTodo), 카테고리 분류, 오늘의 메뉴 추천, 예약 메시지(FutureMessage) 기능을 제공합니다.

---

## Tech Stack

| 영역 | 기술 |
|------|------|
| Framework | NestJS 11 |
| Language | TypeScript 5.7 |
| Database | MongoDB (Mongoose 8) |
| Auth | JWT (access 15m / refresh 30d) + Passport.js |
| API | REST (port 8080) + gRPC (port 50051) |
| Logging | nestjs-pino + pino-pretty |
| Scheduler | @nestjs/schedule (KST 기준) |
| API Docs | Swagger (`/api-docs`) |
| Testing | Jest 29 + ts-jest |
| Alert | Discord Webhook (5xx 전용) |

---

## Architecture

### Hexagonal Architecture (Ports & Adapters)

각 도메인 모듈은 아래 레이어 구조를 따릅니다.

```
┌─────────────────────────────────────────────────────┐
│                   Adapters (In)                     │
│   REST Controller / gRPC Controller / Scheduler     │
└────────────────────┬────────────────────────────────┘
                     │  implements Use Case Port (In)
┌────────────────────▼────────────────────────────────┐
│               Application Layer                     │
│   Use Cases (Services) / Commands / Results         │
└────────────────────┬────────────────────────────────┘
                     │  calls Persistence/Query Port (Out)
┌────────────────────▼────────────────────────────────┐
│               Domain Layer                          │
│   Entities / Value Objects / Enums / Port Interfaces│
└────────────────────┬────────────────────────────────┘
                     │  implements Out Port
┌────────────────────▼────────────────────────────────┐
│               Adapters (Out)                        │
│   Repository Impl / External API Adapter            │
└─────────────────────────────────────────────────────┘
```

### Directory Structure

```
src/
├── hb-backend-api/           # 도메인 모듈 (비즈니스 로직)
│   ├── auth/
│   ├── category/
│   ├── daily-todo/
│   ├── future-message/
│   ├── health/
│   ├── menu-recommendation/
│   ├── outbox/
│   ├── today-menu/
│   └── user/
├── infra/                    # 인프라 어댑터
│   ├── adapters/jwt/         # JWT 어댑터
│   ├── grpc/                 # gRPC 옵션
│   └── mongo/                # MongoDB 트랜잭션
└── shared/                   # 공통 유틸
    ├── adapters/in/rest/     # Guard, Filter, Interceptor, Strategy
    ├── adapters/in/job/      # 스케줄러 데코레이터
    ├── constants/
    ├── di/                   # DI 토큰 레지스트리
    ├── discord/              # Discord Webhook
    └── trace/                # 분산 추적 컨텍스트
```

---

## Domain Modules

### User
사용자 계정을 관리합니다.
- 생성 시 `bcrypt`로 패스워드 해싱 (Mongoose pre-save hook)
- Value Objects: `UserId`, `UserNickname`

### Auth
JWT 기반 인증을 담당합니다.
- Access Token: 15분 (HttpOnly cookie)
- Refresh Token: 30일 (HttpOnly cookie)
- `JwtAuthGuard`: 만료된 access token → refresh token으로 자동 갱신 시도

### Category
할 일 분류 카테고리 CRUD를 담당합니다.
- 동일 소유자 내 제목 중복 불허 (생성 시 `findByTitle` 선조회)
- Value Objects: `CategoryId`, `CategoryTitle`

### DailyTodo
일일 할 일의 생성/조회/수정/삭제를 담당합니다.
- 생성 시 기본값: `progress = PROGRESS`, `cycle = EVERYDAY`
- 반복 주기 Enum: `EVERYDAY` / `EVERY_WEEKDAY` / `EVERY_WEEKEND`
- 완료 상태 Enum: `PROGRESS` / `COMPLETED`
- 날짜 VO: `YearMonthDayString` (YYYY-MM-DD 포맷 검증 포함)

### MenuRecommendation
메뉴 후보를 등록·조회합니다.

### TodayMenu
추천 메뉴 목록에서 오늘의 메뉴를 upsert·pick합니다.
- `recommendedMenu`가 null이면 `NotFoundException`

### FutureMessage
예약 메시지를 저장하고, 스케줄러가 매일 오전 9시(KST)에 처리합니다.

### Outbox
Transactional Outbox 패턴의 이벤트 저장소입니다. (→ [ADR: Outbox & gRPC](#adr-transactional-outbox--grpc) 참고)

---

## Key Design Patterns

### 1. DI Token Registry

모든 의존성 주입 토큰을 `src/shared/di/token.di.ts` 한 곳에서 관리합니다. 문자열 토큰 충돌을 방지하고, 토큰 자동 등록 유틸(`DITokenRegister`)을 통해 등록합니다.

```typescript
// 사용 예
@Inject(DIToken.DailyTodoModule.DailyTodoQueryPort)
private readonly queryPort: DailyTodoQueryPort;
```

### 2. Value Objects (VO)

모든 식별자와 핵심 값은 VO로 래핑됩니다.

- **불변성**: 생성자에서 `Object.freeze(this)` 호출
- **동등성 비교**: `equals()` 메서드 제공 (참조 비교 오류 방지)
- **유효성 검증**: `fromString()` 팩토리 메서드에서 즉시 실패(fail-fast)

```
UserId / UserNickname
CategoryId / CategoryTitle
DailyTodoId / YearMonthDayString
TodayMenuId
MenuRecommendationId
```

### 3. @Transactional Decorator

MongoDB 세션을 `AsyncLocalStorage`로 전파합니다. 서비스 메서드에 `@Transactional()`을 붙이면 해당 메서드 실행 전체가 하나의 MongoDB 트랜잭션으로 묶입니다.

```
@Transactional()
    │
    ▼
TransactionRunner.run()
    │  AsyncLocalStorage에 session 저장
    ▼
MongoSessionContext.getSession()  ← Repository에서 세션 꺼내 사용
```

클래스에 `public readonly transactionRunner: TransactionRunner`가 있어야 동작합니다.

### 4. Distributed Trace Context

모든 HTTP 요청에 `x-hobom-trace-id` 헤더를 기반으로 traceId를 발급하고, `AsyncLocalStorage`로 요청 스코프 전역에서 접근합니다. 헤더가 없으면 `randomUUID()`로 생성합니다.

### 5. @RegisterJob (스케줄러)

`@nestjs/schedule`의 `@Cron`을 감싸는 커스텀 데코레이터입니다. **기본 타임존을 `Asia/Seoul`로 고정**합니다.

```typescript
@RegisterJob({
  name: "process-future-message-scheduler",
  cron: CronExpression.DAILY_9AM,  // "0 9 * * *" → KST 09:00
})
```

---

## ADR: Transactional Outbox & gRPC

### 배경

서비스 간 이벤트 전달이 필요한데, 비즈니스 트랜잭션과 메시지 발행을 원자적으로 처리해야 합니다.

### 결정: Transactional Outbox 패턴

상태 변경과 이벤트 저장을 **동일한 MongoDB 트랜잭션** 안에서 처리합니다.

```
┌──────────────────────────┐
│  비즈니스 로직 처리       │
│  + outbox 컬렉션에 기록  │ ← 하나의 트랜잭션
└────────────┬─────────────┘
             │ PENDING 이벤트
┌────────────▼─────────────┐
│  Consumer 서비스 (polling)│
│  gRPC로 조회 후 처리      │
│  → PatchMarkAsSent 호출  │
└──────────────────────────┘
```

이벤트 타입:
- `MESSAGE`: 예약 메시지 전송
- `HOBOM_LOG`: HTTP 요청/응답 로그

### 결정: 내부 통신에 gRPC 사용

Consumer 서비스들이 gRPC로 pending 이벤트를 polling합니다.

| 항목 | gRPC | REST |
|------|------|------|
| 계약 | proto 파일 (명시적) | OpenAPI (선택적) |
| 타입 안전성 | 빌드 시 검증 | 런타임 |
| 성능 | 바이너리, HTTP/2 | JSON, HTTP/1.1 |
| 코드 생성 | 자동 | 수동 |

proto 파일은 `hobom-buf-proto` git submodule로 서버와 consumer가 동일한 계약을 공유합니다.

---

## Security

| 항목 | 구현 |
|------|------|
| 인증 | JWT (access 15m / refresh 30d), HttpOnly cookie |
| 패스워드 | bcrypt 해싱 (Mongoose pre-save hook) |
| 요청 검증 | `ValidationPipe` + `class-validator` (`whitelist: true`, `forbidNonWhitelisted: true`) |
| CORS | `app.enableCors()` |
| 민감 정보 로그 | `authorization`, `cookie` 헤더 redact (pino) |
| 에러 알림 | Discord Webhook — HTTP 5xx만 발송 (4xx 제외) |

---

## Logging

`nestjs-pino`를 사용합니다.

- **개발 환경** (`NODE_ENV !== "production"`): `pino-pretty` — 컬러 출력, 단일 라인
- **프로덕션**: 구조화된 JSON 출력 — 로그 집계 시스템(ELK, Loki 등)과 연동 가능
- **로그 레벨**: 환경변수 `LOG_LEVEL` (기본값: `info`)
- **HTTP 로그**: 모든 요청/응답을 Outbox(`HOBOM_LOG` 이벤트)에 저장

---

## Testing

```
test/
├── factories/          # 테스트용 공통 팩토리
├── hb-backend-api/
│   ├── auth/           # JwtAuthGuard, LoginAuthService
│   ├── category/       # 서비스 레이어 (5개 유즈케이스)
│   ├── daily-todo/     # 서비스 레이어 (7개 유즈케이스) + 어댑터
│   ├── today-menu/     # 서비스 레이어 + 어댑터
│   ├── user/           # CreateUserService + 어댑터
│   └── shared/         # GlobalExceptionFilter
└── shared/
    └── date/           # DateHelper
```

**현황**: 26 suites / 82 tests (unit)

**테스트 전략**:
- 모든 서비스 레이어는 `Test.createTestingModule` + mock port로 격리 테스트
- `TransactionRunner`는 `{ run: jest.fn((cb) => cb()) }`로 목킹
- DI 토큰을 키로 사용하여 실제 주입 경로와 동일하게 구성

**Jest 설정 주의사항**:
- `rootDir: "test"` 기준이므로 `src/...` 비상대 경로 임포트를 위해 `modulePaths: ["<rootDir>/../"]` 필수
