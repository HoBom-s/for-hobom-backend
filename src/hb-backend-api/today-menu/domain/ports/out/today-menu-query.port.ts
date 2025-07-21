import { TodayMenuId } from "../../model/today-menu.vo";
import { TodayMenuRelationEntity } from "../../model/today-menu-with-relations.entity";

export interface TodayMenuQueryPort {
  findById(id: TodayMenuId): Promise<TodayMenuRelationEntity>;
}
