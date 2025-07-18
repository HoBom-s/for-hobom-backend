import { UpsertTodayMenuCommand } from "../out/upsert-today-menu.command";
import { TodayMenuId } from "../../model/today-menu.vo";

export interface UpsertTodayMenuUseCase {
  invoke(command: UpsertTodayMenuCommand): Promise<TodayMenuId>;
}
