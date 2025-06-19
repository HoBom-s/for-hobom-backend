import { EventType } from "../enum/event-type.enum";
import { createTodayMenuPayload } from "./today-menu.payload";

export const OutboxPayloadFactoryRegistry: Record<
  EventType,
  (input: any) => Record<string, string>
> = {
  [EventType.TODAY_MENU]: createTodayMenuPayload,
};
