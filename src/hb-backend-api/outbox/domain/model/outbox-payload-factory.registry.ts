import { EventType } from "./event-type.enum";
import { createMessagePayload, MessagePayload } from "./message.payload";
import {
  createHoBomLogPayload,
  HoBomLogPayloadType,
} from "./hobom-log.payload";

interface EventInputMap {
  [EventType.MESSAGE]: MessagePayload;
  [EventType.HOBOM_LOG]: HoBomLogPayloadType;
}

type OutboxPayloadFactory<T> = (
  input: T,
) => Record<string, string | number | Record<string, any>>;

type OutboxPayloadFactoryRegistryType = {
  [K in EventType]: OutboxPayloadFactory<EventInputMap[K]>;
};

export const OutboxPayloadFactoryRegistry: OutboxPayloadFactoryRegistryType = {
  [EventType.MESSAGE]: createMessagePayload,
  [EventType.HOBOM_LOG]: createHoBomLogPayload,
};
