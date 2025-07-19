import { EventType } from "../../model/event-type.enum";
import { OutboxStatus } from "../../model/outbox-status.enum";
import { FindOutboxMessageQueryResult } from "../out/find-outbox-message-query.result";

export interface FindOutboxByEventTypeAndStatusUseCase {
  invoke(
    eventType: EventType,
    status: OutboxStatus,
  ): Promise<FindOutboxMessageQueryResult[]>;
}
