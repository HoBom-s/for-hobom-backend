import { GetDailyTodoUseCase } from "../ports/in/get-daily-todo.use-case";
import { Inject, Injectable } from "@nestjs/common";
import { DIToken } from "../../../../shared/di/token.di";
import { DailyTodoQueryPort } from "../ports/out/daily-todo-query.port";
import { UserId } from "src/hb-backend-api/user/domain/vo/user-id.vo";
import { DailyTodoId } from "../../domain/vo/daily-todo-id.vo";
import { DailyTodoWithRelationQueryResult } from "../result/daily-todo-query.result";
import { DailyTodoWithRelationEntity } from "../../domain/entity/daily-todo.retations";

@Injectable()
export class GetDailyTodoService implements GetDailyTodoUseCase {
  constructor(
    @Inject(DIToken.DailyTodoModule.DailyTodoQueryPort)
    private readonly dailyTodoQueryPort: DailyTodoQueryPort,
  ) {}

  public async invoke(
    id: DailyTodoId,
    owner: UserId,
  ): Promise<DailyTodoWithRelationQueryResult> {
    const dailyTodo = await this.findById(id, owner);

    return DailyTodoWithRelationQueryResult.from(dailyTodo);
  }

  private async findById(
    id: DailyTodoId,
    owner: UserId,
  ): Promise<DailyTodoWithRelationEntity> {
    return await this.dailyTodoQueryPort.findById(id, owner);
  }
}
