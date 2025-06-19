import { EventType } from "../../../domain/enum/event-type.enum";
import { OutboxStatus } from "../../../domain/enum/outbox-status.enum";

export interface FindTodayMenuOutboxDtoType {
  eventType: EventType;
  status: OutboxStatus;
}
