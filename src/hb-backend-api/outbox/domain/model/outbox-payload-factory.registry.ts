import { EventType } from "./event-type.enum";
import { createMessagePayload, MessagePayload } from "./message.payload";
import {
  createHoBomLogPayload,
  HoBomLogPayloadType,
} from "./hobom-log.payload";
import {
  createLawChangedPayload,
  LawChangedPayload,
} from "./law-changed.payload";

interface EventInputMap {
  [EventType.MESSAGE]: MessagePayload;
  [EventType.HOBOM_LOG]: HoBomLogPayloadType;
  [EventType.LAW_CHANGED]: LawChangedPayload;
}

type OutboxPayloadFactory<T> = (input: T) => Record<string, unknown>;

type OutboxPayloadFactoryRegistryType = {
  [K in EventType]: OutboxPayloadFactory<EventInputMap[K]>;
};

export const OutboxPayloadFactoryRegistry: OutboxPayloadFactoryRegistryType = {
  [EventType.MESSAGE]: createMessagePayload,
  [EventType.HOBOM_LOG]: createHoBomLogPayload,
  [EventType.LAW_CHANGED]: createLawChangedPayload,
};
