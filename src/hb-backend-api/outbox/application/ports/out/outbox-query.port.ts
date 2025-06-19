import { FindOutboxEntity } from "../../../domain/entity/find-outbox.entity";
import { EventType } from "../../../domain/enum/event-type.enum";
import { OutboxStatus } from "../../../domain/enum/outbox-status.enum";

export interface OutboxQueryPort {
  findByEventTypeAndStatus(
    eventType: EventType,
    status: OutboxStatus,
  ): Promise<FindOutboxEntity[]>;
}
