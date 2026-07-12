import { Types } from "mongoose";
import { FindOutboxLawQueryResult } from "src/hb-backend-api/outbox/domain/ports/out/find-outbox-law-query.result";
import { FindOutboxLogQueryResult } from "src/hb-backend-api/outbox/domain/ports/out/find-outbox-log-query.result";
import { FindOutboxEntity } from "src/hb-backend-api/outbox/domain/model/find-outbox.entity";
import { OutboxId } from "src/hb-backend-api/outbox/domain/model/outbox-id.vo";
import { EventType } from "src/hb-backend-api/outbox/domain/model/event-type.enum";
import { OutboxStatus } from "src/hb-backend-api/outbox/domain/model/outbox-status.enum";

describe("FindOutboxQueryResult", () => {
  const now = new Date();
  const outboxId = OutboxId.fromString(new Types.ObjectId().toHexString());

  const entity = FindOutboxEntity.of({
    id: outboxId,
    eventId: "evt-1",
    eventType: EventType.LAW_CHANGED,
    payload: { lawName: "개인정보 보호법" } as never,
    status: OutboxStatus.SENT,
    retryCount: 2,
    sentAt: now,
    failedAt: null,
    lastError: null,
    version: 1,
    createdAt: now,
    updatedAt: now,
  });

  describe("FindOutboxLawQueryResult", () => {
    it("should create from FindOutboxEntity and expose all getters", () => {
      const result = FindOutboxLawQueryResult.from(entity);

      expect(result.getId).toBe(outboxId);
      expect(result.getEventId).toBe("evt-1");
      expect(result.getEventType).toBe(EventType.LAW_CHANGED);
      expect(result.getPayload).toEqual({ lawName: "개인정보 보호법" });
      expect(result.getStatus).toBe(OutboxStatus.SENT);
      expect(result.getRetryCount).toBe(2);
      expect(result.getSentAt).toBe(now);
      expect(result.getFailedAt).toBeNull();
      expect(result.getLastError).toBeNull();
      expect(result.getVersion).toBe(1);
      expect(result.getCreatedAt).toBe(now);
      expect(result.getUpdatedAt).toBe(now);
    });
  });

  describe("FindOutboxLogQueryResult", () => {
    it("should create from FindOutboxEntity and expose all getters", () => {
      const logEntity = FindOutboxEntity.of({
        id: outboxId,
        eventId: "evt-2",
        eventType: EventType.HOBOM_LOG,
        payload: { message: "test log" } as never,
        status: OutboxStatus.FAILED,
        retryCount: 3,
        sentAt: null,
        failedAt: now,
        lastError: "timeout",
        version: 2,
        createdAt: now,
        updatedAt: now,
      });

      const result = FindOutboxLogQueryResult.from(logEntity);

      expect(result.getId).toBe(outboxId);
      expect(result.getEventId).toBe("evt-2");
      expect(result.getEventType).toBe(EventType.HOBOM_LOG);
      expect(result.getPayload).toEqual({ message: "test log" });
      expect(result.getStatus).toBe(OutboxStatus.FAILED);
      expect(result.getRetryCount).toBe(3);
      expect(result.getSentAt).toBeNull();
      expect(result.getFailedAt).toBe(now);
      expect(result.getLastError).toBe("timeout");
      expect(result.getVersion).toBe(2);
      expect(result.getCreatedAt).toBe(now);
      expect(result.getUpdatedAt).toBe(now);
    });
  });
});
