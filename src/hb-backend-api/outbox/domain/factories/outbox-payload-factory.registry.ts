import { EventType } from "../enum/event-type.enum";
import { createTodayMenuPayload, TodayMenuPayload } from "./today-menu.payload";

interface EventInputMap {
  [EventType.TODAY_MENU]: TodayMenuPayload;
}

type OutboxPayloadFactory<T> = (input: T) => Record<string, string>;

type OutboxPayloadFactoryRegistryType = {
  [K in EventType]: OutboxPayloadFactory<EventInputMap[K]>;
};

export const OutboxPayloadFactoryRegistry: OutboxPayloadFactoryRegistryType = {
  [EventType.TODAY_MENU]: createTodayMenuPayload,
};
