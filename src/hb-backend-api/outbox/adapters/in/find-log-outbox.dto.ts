import { EventType } from "../../domain/model/event-type.enum";
import { OutboxStatus } from "../../domain/model/outbox-status.enum";

export interface FindLogOutboxDto {
  eventType: EventType;
  status: OutboxStatus;
}
