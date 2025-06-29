import { EventType } from "../enum/event-type.enum";
import { createTodayMenuPayload, TodayMenuPayload } from "./today-menu.payload";
import {
  createHoBomLogPayload,
  HoBomLogPayloadType,
} from "./hobom-log.payload";

interface EventInputMap {
  [EventType.TODAY_MENU]: TodayMenuPayload;
  [EventType.HOBOM_LOG]: HoBomLogPayloadType;
}

type OutboxPayloadFactory<T> = (
  input: T,
) => Record<string, string | number | Record<string, any>>;

type OutboxPayloadFactoryRegistryType = {
  [K in EventType]: OutboxPayloadFactory<EventInputMap[K]>;
};

export const OutboxPayloadFactoryRegistry: OutboxPayloadFactoryRegistryType = {
  [EventType.TODAY_MENU]: createTodayMenuPayload,
  [EventType.HOBOM_LOG]: createHoBomLogPayload,
};
