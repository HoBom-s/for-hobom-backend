import { FindOutboxEntity } from "../../model/find-outbox.entity";
import { EventType } from "../../model/event-type.enum";
import { OutboxStatus } from "../../model/outbox-status.enum";

export interface OutboxQueryPort {
  findByEventTypeAndStatus(
    eventType: EventType,
    status: OutboxStatus,
  ): Promise<FindOutboxEntity[]>;
}
