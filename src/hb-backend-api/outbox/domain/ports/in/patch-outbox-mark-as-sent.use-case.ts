import { EventId } from "../../model/event-id.vo";

export interface PatchOutboxMarkAsSentUseCase {
  invoke(eventId: EventId): Promise<void>;
}
