import { UpsertTodayMenuEntity } from "../../model/upsert-today-menu.entity";
import { TodayMenuId } from "../../model/today-menu.vo";

export interface TodayMenuPersistencePort {
  upsert(entity: UpsertTodayMenuEntity): Promise<TodayMenuId>;
}
