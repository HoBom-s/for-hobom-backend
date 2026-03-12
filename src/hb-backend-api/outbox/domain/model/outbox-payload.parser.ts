import { MessagePayload } from "./message.payload";
import { HoBomLogPayloadType } from "./hobom-log.payload";
import { LawChangedPayload } from "./law-changed.payload";

export interface PayloadMap {
  MESSAGE: MessagePayload;
  HOBOM_LOG: HoBomLogPayloadType;
  LAW_CHANGED: LawChangedPayload;
}

export type OutboxPayloadType = PayloadMap[keyof PayloadMap];

export const payloadCaster: {
  [K in keyof PayloadMap]: (p: unknown) => PayloadMap[K];
} = {
  MESSAGE: (p) => p as MessagePayload,
  HOBOM_LOG: (p) => p as HoBomLogPayloadType,
  LAW_CHANGED: (p) => p as LawChangedPayload,
};
