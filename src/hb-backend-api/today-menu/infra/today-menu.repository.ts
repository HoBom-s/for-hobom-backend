import { UpsertTodayMenuEntity } from "../domain/model/upsert-today-menu.entity";
import { TodayMenuId } from "../domain/model/today-menu.vo";
import { TodayMenuWithRelationsEntity } from "../domain/model/today-menu-with-relations.entity";

export interface TodayMenuRepository {
  upsert(entity: UpsertTodayMenuEntity): Promise<TodayMenuId>;

  findById(id: TodayMenuId): Promise<TodayMenuWithRelationsEntity>;

  findRecommendedMenuById(
    id: TodayMenuId,
  ): Promise<TodayMenuWithRelationsEntity>;
}
