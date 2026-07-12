import { Types } from "mongoose";
import { FindLawOutboxResultDto } from "src/hb-backend-api/outbox/adapters/in/find-law-outbox-result.dto";
import { FindLogOutboxResultDto } from "src/hb-backend-api/outbox/adapters/in/find-log-outbox-result.dto";
import { FindOutboxLawQueryResult } from "src/hb-backend-api/outbox/domain/ports/out/find-outbox-law-query.result";
import { FindOutboxLogQueryResult } from "src/hb-backend-api/outbox/domain/ports/out/find-outbox-log-query.result";
import { FindOutboxEntity } from "src/hb-backend-api/outbox/domain/model/find-outbox.entity";
import { OutboxId } from "src/hb-backend-api/outbox/domain/model/outbox-id.vo";
import { EventType } from "src/hb-backend-api/outbox/domain/model/event-type.enum";
import { OutboxStatus } from "src/hb-backend-api/outbox/domain/model/outbox-status.enum";

describe("FindOutboxResultDto", () => {
  const now = new Date();
  const outboxId = OutboxId.fromString(new Types.ObjectId().toHexString());

  describe("FindLawOutboxResultDto", () => {
    it("should map from FindOutboxLawQueryResult", () => {
      const entity = FindOutboxEntity.of({
        id: outboxId,
        eventId: "evt-law-1",
        eventType: EventType.LAW_CHANGED,
        payload: { lawName: "개인정보 보호법" } as never,
        status: OutboxStatus.SENT,
        retryCount: 1,
        sentAt: now,
        failedAt: null,
        lastError: null,
        version: 1,
        createdAt: now,
        updatedAt: now,
      });
      const queryResult = FindOutboxLawQueryResult.from(entity);

      const dto = FindLawOutboxResultDto.from(queryResult);

      expect(dto.id).toBe(outboxId.toString());
      expect(dto.eventId).toBe("evt-law-1");
      expect(dto.eventType).toBe(EventType.LAW_CHANGED);
      expect(dto.payload).toEqual({ lawName: "개인정보 보호법" });
      expect(dto.status).toBe(OutboxStatus.SENT);
      expect(dto.retryCount).toBe(1);
      expect(dto.sentAt).toBe(now);
      expect(dto.failedAt).toBeNull();
      expect(dto.lastError).toBeNull();
      expect(dto.version).toBe(1);
      expect(dto.createdAt).toBe(now);
      expect(dto.updatedAt).toBe(now);
    });
  });

  describe("FindLogOutboxResultDto", () => {
    it("should map from FindOutboxLogQueryResult", () => {
      const entity = FindOutboxEntity.of({
        id: outboxId,
        eventId: "evt-log-1",
        eventType: EventType.HOBOM_LOG,
        payload: { message: "log" } as never,
        status: OutboxStatus.FAILED,
        retryCount: 3,
        sentAt: null,
        failedAt: now,
        lastError: "connection refused",
        version: 2,
        createdAt: now,
        updatedAt: now,
      });
      const queryResult = FindOutboxLogQueryResult.from(entity);

      const dto = FindLogOutboxResultDto.from(queryResult);

      expect(dto.id).toBe(outboxId.toString());
      expect(dto.eventId).toBe("evt-log-1");
      expect(dto.eventType).toBe(EventType.HOBOM_LOG);
      expect(dto.payload).toEqual({ message: "log" });
      expect(dto.status).toBe(OutboxStatus.FAILED);
      expect(dto.retryCount).toBe(3);
      expect(dto.sentAt).toBeNull();
      expect(dto.failedAt).toBe(now);
      expect(dto.lastError).toBe("connection refused");
      expect(dto.version).toBe(2);
      expect(dto.createdAt).toBe(now);
      expect(dto.updatedAt).toBe(now);
    });
  });
});
