import { TodayMenuId } from "../../../domain/vo/today-menu.vo";
import { TodayMenuRelationEntity } from "../../../domain/entity/today-menu-with-relations.entity";

export interface TodayMenuQueryPort {
  findById(id: TodayMenuId): Promise<TodayMenuRelationEntity>;
}
