import { MessagePayload } from "./message.payload";
import { HoBomLogPayloadType } from "./hobom-log.payload";

export interface PayloadMap {
  MESSAGE: MessagePayload;
  HOBOM_LOG: HoBomLogPayloadType;
}

export type OutboxPayloadType = PayloadMap[keyof PayloadMap];

export const payloadCaster: {
  [K in keyof PayloadMap]: (p: unknown) => PayloadMap[K];
} = {
  MESSAGE: (p) => p as MessagePayload,
  HOBOM_LOG: (p) => p as HoBomLogPayloadType,
};
