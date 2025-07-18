import { CreateFutureMessageCommand } from "../out/create-future-message.command";

export interface CreateFutureMessageUseCase {
  invoke(command: CreateFutureMessageCommand): Promise<void>;
}
