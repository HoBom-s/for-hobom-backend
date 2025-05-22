import { UserId } from "../../../../user/domain/vo/user-id.vo";
import { DailyTodoWithRelationEntity } from "../../../domain/entity/daily-todo.retations";

export interface DailyTodoQueryPort {
  findAll(owner: UserId): Promise<DailyTodoWithRelationEntity[]>;
}
