# Outbox Pattern 실전 — 분산 시스템에서 "정확히 한 번"이 왜 이렇게 어려운가

> 이 글은 분산 시스템에서 데이터 정합성이 깨지는 근본적인 이유에서 출발하여, Outbox Pattern이 왜 탄생했는지, 그리고 실제 프로덕션에서 이 패턴을 구현하며 경험한 것들을 다룹니다.

---

# 단일 서버에서는 문제가 없었다

모놀리스 시절, 트랜잭션은 단순했습니다.

주문이 생성되면 재고를 차감하고, 결제를 처리하고, 알림을 보낸다. 이 모든 것이 하나의 데이터베이스, 하나의 트랜잭션 안에서 일어났습니다. 하나라도 실패하면 전부 롤백. ACID가 보장하는 세계에서, 데이터 정합성은 데이터베이스가 알아서 해결해 주는 문제였습니다.

```
BEGIN TRANSACTION
  INSERT INTO orders (...)
  UPDATE inventory SET stock = stock - 1
  INSERT INTO notifications (...)
COMMIT
```

이 코드가 실패할 수 있는 경우는 명확하고, 실패하면 깔끔하게 롤백됩니다. 개발자가 정합성에 대해 깊이 고민할 필요가 없었습니다.

문제는 서비스가 분리되면서 시작됩니다.

# 두 시스템을 동시에 바꿀 수 없다

마이크로서비스 아키텍처에서 "주문 생성 후 알림 전송"이라는 요구사항을 구현한다고 가정해 보겠습니다. 주문 서비스와 알림 서비스는 별도의 프로세스이고, 각자의 데이터베이스를 가지고 있습니다.

가장 직관적인 구현은 이렇습니다.

```typescript
async createOrder(command: CreateOrderCommand): Promise<void> {
  // 1. 주문을 DB에 저장
  await this.orderRepository.save(command);

  // 2. 알림 서비스에 메시지 전송
  await this.messageQueue.send({ type: "ORDER_CREATED", orderId: order.id });
}
```

이 코드는 두 가지 시스템(데이터베이스와 메시지 큐)에 쓰기를 수행합니다. 문제는, 이 두 쓰기를 하나의 원자적 연산으로 묶을 수 없다는 것입니다.

실패 시나리오를 그려보겠습니다.

**시나리오 1: DB 성공, 메시지 전송 실패**
```
1. 주문 DB 저장 ✅
2. 메시지 큐 전송 ❌ (네트워크 오류)
→ 주문은 생성되었는데, 알림은 영원히 발송되지 않음
```

**시나리오 2: DB 성공, 메시지 전송 성공, 응답 수신 실패**
```
1. 주문 DB 저장 ✅
2. 메시지 큐 전송 ✅
3. 메시지 큐 응답 수신 ❌ (타임아웃)
→ 메시지가 전송되었는지 알 수 없음. 재시도하면 중복 전송
```

**시나리오 3: 순서를 바꿔볼까?**
```
1. 메시지 큐 전송 ✅
2. 주문 DB 저장 ❌
→ 주문은 없는데 알림은 발송됨
```

순서를 어떻게 바꿔도 문제가 발생합니다. 이것은 코드의 버그가 아니라, 분산 시스템의 근본적인 제약입니다.

이 문제에는 이름이 있습니다. **Dual Write Problem**(이중 쓰기 문제). 두 개의 서로 다른 시스템에 원자적으로 쓰기를 수행할 수 없다는 것. 1970년대부터 알려진 문제이지만, 마이크로서비스 시대에 와서 모든 팀이 일상적으로 마주하는 문제가 되었습니다.

# 사람들이 시도한 해결책들

## 2PC (Two-Phase Commit)

분산 트랜잭션의 고전적 해법은 2PC입니다. 코디네이터가 모든 참여자에게 "준비됐나?"라고 물어보고(Phase 1), 전원이 "예"라고 하면 "커밋하라"고 명령하는(Phase 2) 프로토콜.

```
Phase 1: Prepare
  Coordinator → DB: "준비됐나?" → DB: "예"
  Coordinator → MQ: "준비됐나?" → MQ: "예"

Phase 2: Commit
  Coordinator → DB: "커밋하라" → DB: ✅
  Coordinator → MQ: "커밋하라" → MQ: ✅
```

이론적으로는 완벽합니다. 하지만 실무에서 2PC는 몇 가지 치명적인 문제를 안고 있습니다.

**첫째, 코디네이터가 단일 장애점(SPOF)입니다.** Phase 1과 Phase 2 사이에서 코디네이터가 죽으면, 참여자들은 커밋해야 할지 롤백해야 할지 알 수 없는 상태에 놓입니다.

**둘째, 모든 참여자가 2PC를 지원해야 합니다.** MongoDB는 분산 트랜잭션을 지원하지만, Kafka나 RabbitMQ와 묶어서 2PC를 돌리는 것은 현실적이지 않습니다. 이기종 시스템 간 2PC는 대부분의 경우 불가능합니다.

**셋째, 성능.** 2PC 동안 모든 참여자가 락을 잡고 대기합니다. 트랜잭션이 길어지면 전체 시스템의 처리량이 급격히 떨어집니다.

Google의 Spanner 같은 시스템은 2PC를 대규모로 운영하지만, 이는 TrueTime이라는 원자시계 기반의 전용 인프라 위에서만 가능한 이야기입니다. 일반적인 마이크로서비스 환경에서 2PC는 사실상 선택지가 아닙니다.

## Saga Pattern

2PC의 대안으로 등장한 것이 Saga 패턴입니다. 1987년, Hector Garcia-Molina와 Kenneth Salem이 제안한 이 패턴은 하나의 긴 트랜잭션을 여러 개의 로컬 트랜잭션으로 분리하고, 실패 시 보상 트랜잭션(compensating transaction)을 실행하여 일관성을 맞추는 방식입니다.

```
주문 생성 → 재고 차감 → 결제 처리 → 알림 발송
                         ❌ 실패!
            ← 재고 복원 ← 주문 취소 (보상 트랜잭션)
```

Saga는 2PC의 성능 문제를 해결하지만, 새로운 복잡도를 만들어 냅니다. 보상 트랜잭션을 모든 단계에 대해 설계해야 하고, 중간 상태(예: 주문은 생성됐지만 결제는 아직인 상태)가 외부에 노출될 수 있습니다.

그리고 무엇보다, Saga에서도 각 단계의 로컬 트랜잭션과 메시지 전송 사이의 원자성 문제는 여전히 남아 있습니다. "DB에 쓰고 다음 단계에 메시지를 보낸다"는 행위 자체가 Dual Write이기 때문입니다.

결국 문제는 같은 곳으로 수렴합니다: **DB 쓰기와 메시지 발행을 어떻게 원자적으로 만들 것인가?**

# Outbox Pattern의 탄생

Outbox Pattern은 이 문제에 대한 놀랍도록 단순한 답입니다.

**메시지를 외부로 직접 보내지 말고, DB에 저장하라.**

```
BEGIN TRANSACTION
  INSERT INTO orders (...)           -- 비즈니스 데이터
  INSERT INTO outbox (...)           -- 발행할 메시지
COMMIT
```

하나의 DB, 하나의 트랜잭션. 비즈니스 데이터와 발행할 메시지를 같은 트랜잭션에 묶어 저장합니다. 두 시스템에 쓰는 대신 하나의 시스템에만 쓰기 때문에, Dual Write 문제 자체가 사라집니다.

그러면 outbox 테이블에 쌓인 메시지는 누가 보내는가? 별도의 프로세스가 outbox 테이블을 주기적으로 폴링(polling)하거나, DB의 변경 로그(CDC)를 감시하여 메시지를 외부 시스템으로 전달합니다.

```
[서비스]
  └─ @Transactional
       ├─ 도메인 데이터 저장
       └─ outbox 이벤트 저장 (같은 트랜잭션)

[별도 프로세스 (Polling)]
  └─ outbox에서 PENDING 이벤트 조회
       ├─ 외부 시스템에 전달
       └─ 상태를 SENT로 변경
```

이 패턴의 이름은 이메일의 "보낼 편지함(Outbox)"에서 왔습니다. 편지를 쓰면 바로 우체국에 가는 게 아니라, 보낼 편지함에 넣어 두고 우체부가 수거해 가는 것. 정확히 같은 구조입니다.

Outbox Pattern이 공식적으로 명명된 시점은 명확하지 않지만, Chris Richardson의 "Microservices Patterns"(2018)과 Debezium 프로젝트의 CDC 기반 Outbox 커넥터가 이 패턴을 널리 알리는 데 크게 기여했습니다.

# HoBom에서의 Outbox 구현

HoBom 시스템은 세 종류의 이벤트를 Outbox Pattern으로 처리합니다.

| 이벤트 | 용도 | 소비자 |
|--------|------|--------|
| `MESSAGE` | 이메일/푸시 알림 | hobom-event-processor (Go) |
| `HOBOM_LOG` | HTTP 요청/응답 로그 | hobom-event-processor (Go) |
| `LAW_CHANGED` | 개인정보 보호법 변경 감지 → 학습자료 생성 | hobom-event-processor (Go) → hobom-llm-service-backend |

전체 흐름을 개인정보 보호법 변경 감지를 예로 설명하겠습니다.

```
[Cron Job: 법령 스크래핑]
  └─ @Transactional()
       ├─ 법령 버전 저장
       ├─ 변경 diff 저장
       └─ outbox 이벤트 저장 (LAW_CHANGED)

[hobom-event-processor (Go)]
  └─ gRPC polling: PENDING 이벤트 조회
       └─ hobom-llm-service-backend에 학습자료 생성 요청
            └─ 완료 후 gRPC: outbox 상태를 SENT로 변경

[Scheduler: 매일 새벽 3시]
  └─ 30일 지난 outbox 이벤트 정리
```

## Outbox 스키마

```typescript
@Schema({ collection: "outbox" })
export class OutboxEntity extends BaseEntity {
  @Prop({ type: String, required: true, unique: true, default: () => randomUUID() })
  eventId: string;

  @Prop({ type: String, enum: EventType, required: true })
  eventType: EventType;

  @Prop({ type: Mixed, required: true })
  payload: Record<string, unknown>;

  @Prop({ type: String, enum: OutboxStatus, default: OutboxStatus.PENDING })
  status: OutboxStatus;

  @Prop({ type: Number, required: true, default: 0 })
  retryCount: number;

  @Prop({ type: Date, default: null })
  sentAt: Date | null;

  @Prop({ type: Date, default: null })
  failedAt: Date | null;

  @Prop({ type: String, default: null })
  lastError: string | null;

  @Prop({ type: Number, required: true, default: 1 })
  version: number;
}
```

몇 가지 설계 결정을 설명하겠습니다.

**`eventId`는 UUID입니다.** MongoDB의 `_id`와 별개로, 이벤트 자체의 식별자를 UUID로 관리합니다. 외부 시스템이 이벤트를 참조할 때 MongoDB의 ObjectId를 노출하지 않기 위함이고, 멱등성(idempotency) 보장에도 활용됩니다. 소비자가 같은 `eventId`를 두 번 받으면 중복 처리를 건너뛸 수 있습니다.

**`version` 필드는 낙관적 잠금(Optimistic Locking)을 위한 것입니다.** 상태를 변경할 때 `$inc: { version: 1 }`로 버전을 올립니다. 두 프로세스가 동시에 같은 이벤트를 처리하려 할 때, 먼저 처리한 쪽이 버전을 올리면 나중에 온 쪽의 업데이트는 실패합니다.

**`retryCount`와 `lastError`는 운영을 위한 필드입니다.** 재시도 횟수와 마지막 에러 메시지를 기록해 두면, 장애 분석 시 "이 이벤트가 왜 3번이나 실패했는지"를 별도의 로깅 시스템 없이도 추적할 수 있습니다.

## 핵심: @Transactional과 AsyncLocalStorage

Outbox Pattern의 전부는 "비즈니스 데이터와 outbox 이벤트를 같은 트랜잭션에 넣는 것"입니다. HoBom에서는 `@Transactional()` 데코레이터가 이 역할을 합니다.

```typescript
@Transactional()
public async invoke(): Promise<void> {
  // 1. 법령 데이터 저장
  await this.lawVersionPersistencePort.save({ ... });

  // 2. 변경 diff 저장
  await this.lawDiffPersistencePort.save({ ... });

  // 3. outbox 이벤트 저장 — 위 1, 2와 같은 트랜잭션
  await this.outboxPersistencePort.save(
    CreateOutboxEntity.of(EventType.LAW_CHANGED, { diffId, changes }, OutboxStatus.PENDING, 0, 1),
  );
}
```

1, 2, 3 중 하나라도 실패하면 전부 롤백됩니다. 법령 데이터는 저장됐는데 outbox 이벤트가 누락되는 상황은 발생하지 않습니다.

이 마법의 내부를 들여다보면, Node.js의 `AsyncLocalStorage`가 핵심입니다.

```typescript
// transaction.context.ts
import { AsyncLocalStorage } from "async_hooks";
import { ClientSession } from "mongoose";

const sessionStorage = new AsyncLocalStorage<ClientSession>();

export const MongoSessionContext = {
  runWithSession: <T>(session: ClientSession, fn: () => Promise<T>) =>
    sessionStorage.run(session, fn),
  getSession: (): ClientSession | undefined =>
    sessionStorage.getStore(),
} as const;
```

```typescript
// transaction.runner.ts
async run<T>(fn: () => Promise<T>): Promise<T> {
  const session = await this.conn.startSession();
  try {
    return await session.withTransaction(() =>
      MongoSessionContext.runWithSession(session, fn),
    );
  } finally {
    await session.endSession();
  }
}
```

`AsyncLocalStorage`는 Java의 `ThreadLocal`과 유사한 개념이지만, Node.js의 비동기 모델에 맞게 설계된 것입니다. 하나의 비동기 실행 체인 안에서 세션 객체를 공유하되, 다른 요청과는 격리됩니다.

이 덕분에 `outboxRepository.save()`는 매개변수로 세션을 받지 않아도, 현재 트랜잭션의 세션을 자동으로 가져올 수 있습니다.

```typescript
// outbox.repository.impl.ts
public async save(entity: CreateOutboxEntity): Promise<void> {
  const session = MongoSessionContext.getSession(); // 현재 트랜잭션 세션

  await this.outboxModel.create(
    [{ eventType: entity.getEventType, payload: entity.getPayload, ... }],
    { session },
  );
}
```

메서드 시그니처에 `session` 파라미터가 없습니다. 호출하는 쪽에서 세션을 전달할 필요가 없으니, 비즈니스 로직이 인프라 관심사로부터 깔끔하게 분리됩니다. Spring의 `@Transactional`이 `ThreadLocal`로 커넥션을 전파하는 것과 본질적으로 같은 메커니즘입니다.

## 이벤트 타입별 페이로드 팩토리

Outbox의 `payload` 필드는 `Record<string, unknown>` 타입으로, 이벤트마다 다른 형태의 데이터를 담을 수 있습니다. 하지만 유연함은 곧 위험함입니다. 아무 데이터나 넣을 수 있으면, 잘못된 데이터도 넣을 수 있습니다.

이를 방지하기 위해 이벤트 타입별 페이로드 팩토리를 두었습니다.

```typescript
interface EventInputMap {
  [EventType.MESSAGE]: MessagePayload;
  [EventType.HOBOM_LOG]: HoBomLogPayloadType;
  [EventType.LAW_CHANGED]: LawChangedPayload;
}

export const OutboxPayloadFactoryRegistry: {
  [K in EventType]: (input: EventInputMap[K]) => Record<string, unknown>;
} = {
  [EventType.MESSAGE]: createMessagePayload,
  [EventType.HOBOM_LOG]: createHoBomLogPayload,
  [EventType.LAW_CHANGED]: createLawChangedPayload,
};
```

`EventType.MESSAGE`로 이벤트를 만들면서 `LawChangedPayload` 형태의 데이터를 넣으려 하면, TypeScript 컴파일러가 에러를 발생시킵니다. 런타임이 아니라 빌드 타임에 잘못된 페이로드를 잡아내는 것입니다.

```typescript
// 컴파일 에러 — MESSAGE 이벤트에 LAW_CHANGED 페이로드를 넣을 수 없음
const payload = OutboxPayloadFactoryRegistry.MESSAGE({
  diffId: "...",    // ❌ MessagePayload에는 diffId가 없음
  changes: [],
});

// 정상 — MESSAGE 이벤트에 맞는 페이로드
const payload = OutboxPayloadFactoryRegistry.MESSAGE({
  id: todayMenuId,
  title: "오늘의 추천메뉴가 도착했어요.",
  body: `오늘의 추천 메뉴는 ${pickedName}!`,
  recipient: userInformation.getEmail,
  senderId: userInformation.getId.toString(),
  type: MessageEnum.MAIL_MESSAGE,
});
```

## Polling: Go 서비스가 이벤트를 수거한다

Outbox에 쌓인 이벤트는 `hobom-event-processor`(Go)가 주기적으로 가져갑니다. 이 서비스는 gRPC로 백엔드에 PENDING 상태의 이벤트를 요청하고, 처리 후 SENT로 상태를 변경합니다.

백엔드 쪽의 gRPC 컨트롤러는 이렇게 생겼습니다.

```typescript
@Controller()
@UseGuards(GrpcApiKeyGuard)
export class FindLawOutboxController {
  @GrpcMethod("FindHoBomLawOutboxController", "FindOutboxByEventTypeAndStatusUseCase")
  public async findBy(request: {
    eventType: string;
    status: string;
  }): Promise<{ items: FindLawOutboxResultDto[] }> {
    const outbox = await this.useCase.invoke(
      request.eventType as EventType,
      request.status as OutboxStatus,
    );
    return { items: outbox.map(FindLawOutboxResultDto.from) };
  }
}
```

처리 완료 후 상태 변경도 gRPC로 이루어집니다.

```typescript
@GrpcMethod("PatchOutboxController", "PatchOutboxMarkAsSentUseCase")
public async markAsSent(request: { eventId: string }): Promise<void> {
  const eventId = EventId.fromString(request.eventId);
  await this.patchOutboxMarkAsSentUseCase.invoke(eventId);
}
```

이 proto 계약은 `hobom-buf-proto` 저장소에서 관리됩니다.

```protobuf
service FindHoBomLawOutboxController {
    rpc FindOutboxByEventTypeAndStatusUseCase (Request) returns (Response);
}

message Request {
    string eventType = 1;
    string status = 2;
}

message Response {
    repeated QueryResult items = 1;
}
```

왜 Kafka 같은 메시지 브로커가 아니라 gRPC Polling인가? HoBom의 규모에서는 Kafka가 오버 엔지니어링이었습니다. 이벤트가 하루에 수십 건 수준이고, 2인 팀이 Kafka 클러스터를 운영하는 것은 비용 대비 효과가 맞지 않았습니다. 폴링의 지연(latency)이 문제가 되지 않는 도메인이었기에, 가장 단순한 방식을 선택했습니다.

## Cleanup: 30일 보존, 배치 삭제

Outbox 테이블은 무한히 커질 수 없습니다. 처리 완료된 이벤트를 적절히 정리해야 합니다.

```typescript
@RegisterJob({
  name: "process-expired-outbox-cleanup",
  cron: CronExpression.DAILY_3AM, // 매일 새벽 3시 (KST)
})
export class ProcessExpiredOutboxCleanupScheduler {
  public async process() {
    await this.processExpiredOutboxCleanupUseCase.invoke();
  }
}
```

```typescript
private static readonly BATCH_SIZE = 100;
private static readonly RETENTION_DAYS = 30;

public async invoke(): Promise<void> {
  const olderThan = new Date();
  olderThan.setDate(olderThan.getDate() - 30);

  let totalDeleted = 0;
  let deleted = 0;

  do {
    deleted = await this.outboxPersistencePort.deleteExpiredBatch(olderThan, 100);
    totalDeleted += deleted;
  } while (deleted === 100);

  if (totalDeleted > 0) {
    this.logger.log(`만료된 outbox ${totalDeleted}건 삭제 완료`);
  }
}
```

한 번에 전부 삭제하지 않고 100건씩 배치로 삭제합니다. MongoDB에서 대량 삭제는 WiredTiger 스토리지 엔진에 부하를 줄 수 있고, 삭제 중에 다른 쿼리의 성능이 저하될 수 있기 때문입니다. 배치 삭제는 이 부하를 분산시킵니다.

보존 기간 30일은 "장애 발생 시 이벤트를 재처리할 수 있는 기간"과 "디스크 사용량" 사이의 트레이드오프입니다. 30일이면 대부분의 운영 이슈를 추적하기에 충분하고, 그 이후의 이벤트는 의미 있는 정보를 제공하지 않는다고 판단했습니다.

# Polling vs CDC: 어떤 방식으로 이벤트를 수거할 것인가

Outbox Pattern을 구현하면 다음 질문이 반드시 따라옵니다. **outbox 테이블의 이벤트를 어떻게 외부로 전달할 것인가?**

두 가지 주요 방식이 있습니다.

## Polling (Pull 방식)

HoBom이 사용하는 방식입니다. 별도의 프로세스가 주기적으로 outbox 테이블을 조회하여 PENDING 상태의 이벤트를 가져갑니다.

```
[Event Processor]
  └─ 매 N초마다
       ├─ SELECT * FROM outbox WHERE status = 'PENDING'
       ├─ 이벤트 처리
       └─ UPDATE outbox SET status = 'SENT'
```

**장점:**
- 구현이 단순합니다. DB 조회와 업데이트만 할 수 있으면 됩니다.
- 별도의 인프라가 필요하지 않습니다.
- 디버깅이 쉽습니다. DB를 직접 조회하면 현재 상태를 바로 확인할 수 있습니다.

**단점:**
- 폴링 간격만큼의 지연이 발생합니다.
- 이벤트가 없어도 DB를 조회하므로 불필요한 쿼리가 발생합니다.
- 폴링 간격을 줄이면 DB 부하가 증가하고, 늘리면 지연이 커집니다.

## CDC (Change Data Capture, Push 방식)

DB의 변경 로그(changelog, oplog)를 감시하여, outbox 테이블에 새로운 행이 추가되면 즉시 이벤트로 발행하는 방식입니다. Debezium이 대표적인 CDC 도구입니다.

```
[MongoDB oplog] → [Debezium Connector] → [Kafka] → [Consumer]
```

**장점:**
- 거의 실시간(near real-time) 전달이 가능합니다.
- 폴링처럼 불필요한 DB 쿼리가 발생하지 않습니다.
- 이벤트 순서가 보장됩니다 (oplog의 순서를 따르므로).

**단점:**
- Debezium + Kafka라는 무거운 인프라가 필요합니다.
- 운영 복잡도가 크게 증가합니다. Kafka 클러스터 관리, 커넥터 모니터링 등.
- 장애 지점이 늘어납니다. DB → Debezium → Kafka → Consumer 체인 중 어디서든 문제가 생길 수 있습니다.

## HoBom의 선택과 근거

HoBom은 Polling을 선택했습니다. 이유는 단순합니다.

1. **이벤트 볼륨이 낮습니다.** 하루 수십 건 수준. 이 규모에서 CDC의 실시간성은 과도합니다.
2. **인프라 비용.** 2인 팀이 Kafka + Debezium 클러스터를 운영하는 것은 현실적이지 않습니다.
3. **지연 허용.** "법률이 바뀌면 몇 분 안에 학습자료를 만든다"는 요구사항에서, 폴링의 몇 초 지연은 전혀 문제가 되지 않습니다.

만약 이벤트가 초당 수천 건이 되거나, 밀리초 단위의 실시간 처리가 필요해진다면 CDC로 전환을 고려하겠지만, 현재로서는 Polling이 복잡도 대비 가장 합리적인 선택입니다.

# "정확히 한 번"은 정말 가능한가?

Outbox Pattern을 이야기할 때 빠질 수 없는 질문입니다. 메시지 전달의 세 가지 보장 수준을 정리하겠습니다.

| 보장 수준 | 의미 |
|-----------|------|
| At-most-once | 최대 한 번. 유실 가능, 중복 없음 |
| At-least-once | 최소 한 번. 유실 없음, 중복 가능 |
| Exactly-once | 정확히 한 번. 유실 없음, 중복 없음 |

Outbox Pattern은 **At-least-once** 를 보장합니다. 이벤트는 DB에 저장되어 있으므로 유실되지 않지만, 소비자가 이벤트를 처리한 후 상태를 SENT로 변경하기 전에 죽으면 같은 이벤트를 다시 받게 됩니다.

```
1. Event Processor: outbox 이벤트 조회 (PENDING)
2. Event Processor: 학습자료 생성 요청 ✅
3. Event Processor: outbox 상태를 SENT로 변경 ❌ (프로세스 크래시)

→ 다음 폴링에서 같은 이벤트를 다시 조회
→ 학습자료 생성을 다시 요청 (중복!)
```

그렇다면 "정확히 한 번"은 불가능한가? 분산 시스템의 이론적으로는, 네트워크가 존재하는 한 진정한 Exactly-once는 불가능합니다. 하지만 실무적으로는 **멱등성(Idempotency)** 으로 해결합니다.

소비자가 `eventId`를 기억하고, 이미 처리한 이벤트는 무시하면 됩니다. At-least-once + 멱등한 소비자 = 실질적 Exactly-once. Kafka가 말하는 "Exactly-once semantics"도 본질적으로는 이 조합입니다.

HoBom에서는 `eventId`(UUID)가 이 역할을 합니다. 소비자가 중복 이벤트를 받아도, 같은 `eventId`로 학습자료가 이미 생성되어 있으면 건너뛰는 방식입니다.

# 솔직한 회고

Outbox Pattern은 개념적으로는 단순하지만, 운영하면서 몇 가지 고민이 남아 있습니다.

**이벤트 순서 보장.** 현재 구현에서는 이벤트의 처리 순서를 엄격하게 보장하지 않습니다. 폴링으로 가져온 이벤트를 병렬 처리하면 순서가 뒤바뀔 수 있습니다. HoBom의 현재 이벤트들(알림 발송, 학습자료 생성)은 순서에 민감하지 않아 문제가 되지 않지만, 순서가 중요한 이벤트가 추가된다면 파티셔닝이나 순차 처리를 고려해야 합니다.

**모니터링.** PENDING 상태에서 오래 머무는 이벤트가 있다면, 그것은 소비자의 문제인지 이벤트 자체의 문제인지 빠르게 파악해야 합니다. 현재는 `retryCount`와 `lastError`로 기본적인 추적이 가능하지만, 이벤트 처리 지연에 대한 알림 시스템은 아직 구축하지 못했습니다.

**스키마 진화.** payload가 `Record<string, unknown>` 타입이기 때문에, 이벤트의 스키마가 바뀌면 이미 outbox에 쌓여 있는 미처리 이벤트와의 호환성 문제가 생길 수 있습니다. 이벤트 볼륨이 낮은 현재는 문제가 없지만, 이벤트가 쌓이는 속도가 빨라지면 스키마 버저닝을 고려해야 할 것입니다.

그리고 가장 솔직한 고민. HoBom의 규모에서 Outbox Pattern이 정말 필요했는가? 이벤트가 하루에 수십 건인 시스템에서, "DB에 저장하고 폴링으로 수거한다"는 구조가 "그냥 HTTP로 호출하고 실패하면 재시도한다"보다 나은지 확신이 서지 않을 때가 있습니다.

하지만 이 구현을 통해 확실히 얻은 것이 있습니다. Dual Write 문제가 왜 발생하는지, 트랜잭션 경계가 왜 중요한지, 그리고 "정확히 한 번"이라는 말이 실제로는 얼마나 복잡한 문제를 축약하고 있는지를 직접 경험했다는 것.

분산 시스템의 정합성은 프레임워크가 해결해 주는 문제가 아닙니다. 개발자가 시스템의 경계를 인식하고, 그 경계에서 발생하는 실패를 명시적으로 설계하는 것. Outbox Pattern은 그 설계의 가장 기본적인 출발점이라고 생각합니다.
