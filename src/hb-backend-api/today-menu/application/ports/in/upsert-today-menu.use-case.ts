import { UpsertTodayMenuCommand } from "../../command/upsert-today-menu.command";
import { TodayMenuId } from "../../../domain/vo/today-menu.vo";

export interface UpsertTodayMenuUseCase {
  invoke(command: UpsertTodayMenuCommand): Promise<TodayMenuId>;
}
