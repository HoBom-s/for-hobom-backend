import { EventId } from "../../model/event-id.vo";

export interface PatchOutboxMarkAsFailedUseCase {
  invoke(eventId: EventId, errorMessage: string): Promise<void>;
}
