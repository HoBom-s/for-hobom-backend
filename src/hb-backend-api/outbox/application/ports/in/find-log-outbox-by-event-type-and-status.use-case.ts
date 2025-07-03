import { EventType } from "../../../domain/enum/event-type.enum";
import { OutboxStatus } from "../../../domain/enum/outbox-status.enum";
import { FindOutboxLogQueryResult } from "../../result/find-outbox-log-query.result";

export interface FindLogOutboxByEventTypeAndStatusUseCase {
  invoke(
    eventType: EventType,
    status: OutboxStatus,
  ): Promise<FindOutboxLogQueryResult[]>;
}
