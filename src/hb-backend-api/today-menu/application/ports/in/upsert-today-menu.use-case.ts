import { UpsertTodayMenuCommand } from "../../command/upsert-today-menu.command";

export interface UpsertTodayMenuUseCase {
  invoke(command: UpsertTodayMenuCommand): Promise<void>;
}
