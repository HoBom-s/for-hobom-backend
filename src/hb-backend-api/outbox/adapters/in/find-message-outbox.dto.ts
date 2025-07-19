import { EventType } from "../../domain/model/event-type.enum";
import { OutboxStatus } from "../../domain/model/outbox-status.enum";

export interface FindTodayMenuOutboxDtoType {
  eventType: EventType;
  status: OutboxStatus;
}
