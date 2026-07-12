import { EventType } from "../../model/event-type.enum";
import { OutboxStatus } from "../../model/outbox-status.enum";
import { FindOutboxLawQueryResult } from "../out/find-outbox-law-query.result";

export interface FindLawOutboxByEventTypeAndStatusUseCase {
  invoke(
    eventType: EventType,
    status: OutboxStatus,
  ): Promise<FindOutboxLawQueryResult[]>;
}
