import { CreateNotificationCommand } from "../out/create-notification.command";

export interface CreateNotificationUseCase {
  invoke(command: CreateNotificationCommand): Promise<void>;
}
