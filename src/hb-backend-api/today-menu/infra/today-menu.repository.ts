import { UpsertTodayMenuEntity } from "../domain/entity/upsert-today-menu.entity";

export interface TodayMenuRepository {
  upsert(entity: UpsertTodayMenuEntity): Promise<void>;
}
