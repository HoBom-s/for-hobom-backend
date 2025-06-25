import { EventId } from "../../../domain/vo/event-id.vo";

export interface PatchOutboxMarkAsSentUseCase {
  invoke(eventId: EventId): Promise<void>;
}
