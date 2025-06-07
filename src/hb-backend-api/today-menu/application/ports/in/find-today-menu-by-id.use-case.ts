import { GetTodayMenuQueryResult } from "../../result/get-today-menu-query.result";
import { TodayMenuId } from "../../../domain/vo/today-menu.vo";

export interface FindTodayMenuByIdUseCase {
  invoke(id: TodayMenuId): Promise<GetTodayMenuQueryResult>;
}
