import { TodayMenuPayload } from "./today-menu.payload";
import { HoBomLogPayloadType } from "./hobom-log.payload";

export interface PayloadMap {
  TODAY_MENU: TodayMenuPayload;
  HOBOM_LOG: HoBomLogPayloadType;
}

export type OutboxPayloadType = PayloadMap[keyof PayloadMap];

export const payloadCaster: {
  [K in keyof PayloadMap]: (p: unknown) => PayloadMap[K];
} = {
  TODAY_MENU: (p) => p as TodayMenuPayload,
  HOBOM_LOG: (p) => p as HoBomLogPayloadType,
};
