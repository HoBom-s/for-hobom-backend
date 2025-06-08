import { UpsertTodayMenuEntity } from "../../../domain/entity/upsert-today-menu.entity";
import { TodayMenuId } from "../../../domain/vo/today-menu.vo";

export interface TodayMenuPersistencePort {
  upsert(entity: UpsertTodayMenuEntity): Promise<TodayMenuId>;
}
