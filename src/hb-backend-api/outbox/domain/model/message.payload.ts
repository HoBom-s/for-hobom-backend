import { MessageEnum } from "./message.enum";

export interface MessagePayload {
  id: string;
  title: string;
  body: string;
  recipient: string;
  senderId: string;
  type: MessageEnum;
}

export function createMessagePayload(
  input: MessagePayload,
): Record<string, string> {
  return {
    id: input.id,
    title: input.title,
    body: input.body,
    recipient: input.recipient,
    senderId: input.senderId,
    type: input.type,
  };
}
