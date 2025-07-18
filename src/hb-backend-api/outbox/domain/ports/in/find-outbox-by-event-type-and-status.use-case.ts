import { EventType } from "../../model/event-type.enum";
import { OutboxStatus } from "../../model/outbox-status.enum";
import { FindOutboxMenuQueryResult } from "../out/find-outbox-menu-query.result";

export interface FindOutboxByEventTypeAndStatusUseCase {
  invoke(
    eventType: EventType,
    status: OutboxStatus,
  ): Promise<FindOutboxMenuQueryResult[]>;
}
