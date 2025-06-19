import { EventType } from "../../../domain/enum/event-type.enum";
import { OutboxStatus } from "../../../domain/enum/outbox-status.enum";
import { FindOutboxQueryResult } from "../../result/find-outbox-query.result";

export interface FindOutboxByEventTypeAndStatusUseCase {
  invoke(
    eventType: EventType,
    status: OutboxStatus,
  ): Promise<FindOutboxQueryResult[]>;
}
