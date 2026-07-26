import { Types } from "mongoose";
import { FindLogOutboxResultDto } from "src/hb-backend-api/outbox/adapters/in/find-log-outbox-result.dto";
import { FindOutboxLogQueryResult } from "src/hb-backend-api/outbox/domain/ports/out/find-outbox-log-query.result";
import { FindOutboxEntity } from "src/hb-backend-api/outbox/domain/model/find-outbox.entity";
import { OutboxId } from "src/hb-backend-api/outbox/domain/model/outbox-id.vo";
import { EventType } from "src/hb-backend-api/outbox/domain/model/event-type.enum";
import { OutboxStatus } from "src/hb-backend-api/outbox/domain/model/outbox-status.enum";

describe("FindOutboxResultDto", () => {
  const now = new Date();
  const outboxId = OutboxId.fromString(new Types.ObjectId().toHexString());

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
