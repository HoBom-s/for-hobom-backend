import { GetTodayMenuQueryResult } from "../out/get-today-menu-query.result";
import { TodayMenuId } from "../../model/today-menu.vo";

export interface FindTodayMenuByIdUseCase {
  invoke(id: TodayMenuId): Promise<GetTodayMenuQueryResult>;
}
