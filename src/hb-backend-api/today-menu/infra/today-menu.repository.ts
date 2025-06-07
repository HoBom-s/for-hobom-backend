import { UpsertTodayMenuEntity } from "../domain/entity/upsert-today-menu.entity";
import { TodayMenuId } from "../domain/vo/today-menu.vo";
import { TodayMenuWithRelationsEntity } from "../domain/entity/today-menu-with-relations.entity";

export interface TodayMenuRepository {
  upsert(entity: UpsertTodayMenuEntity): Promise<TodayMenuId>;

  findById(id: TodayMenuId): Promise<TodayMenuWithRelationsEntity>;
}
