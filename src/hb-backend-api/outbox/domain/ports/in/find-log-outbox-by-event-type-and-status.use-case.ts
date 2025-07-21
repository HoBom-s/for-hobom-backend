import { EventType } from "../../model/event-type.enum";
import { OutboxStatus } from "../../model/outbox-status.enum";
import { FindOutboxLogQueryResult } from "../out/find-outbox-log-query.result";

export interface FindLogOutboxByEventTypeAndStatusUseCase {
  invoke(
    eventType: EventType,
    status: OutboxStatus,
  ): Promise<FindOutboxLogQueryResult[]>;
}
