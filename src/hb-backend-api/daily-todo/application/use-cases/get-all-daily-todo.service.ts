import { GetAllDailyTodoUseCase } from "../ports/in/get-all-daily-todo.use-case";
import { Inject, Injectable } from "@nestjs/common";
import { DIToken } from "../../../../shared/di/token.di";
import { DailyTodoQueryPort } from "../ports/out/daily-todo-query.port";
import { DailyTodoWithRelationEntity } from "../../domain/entity/daily-todo.retations";
import { UserId } from "../../../user/domain/vo/user-id.vo";
import { DailyTodoWithRelationQueryResult } from "../ports/out/daily-todo-query.result";

@Injectable()
export class GetAllDailyTodoService implements GetAllDailyTodoUseCase {
  constructor(
    @Inject(DIToken.DailyTodoModule.DailyTodoQueryPort)
    private readonly dailyTodoQueryPort: DailyTodoQueryPort,
  ) {}

  public async invoke(
    owner: UserId,
  ): Promise<DailyTodoWithRelationQueryResult[]> {
    const dailyTodos = await this.findAll(owner);

    return dailyTodos.map(DailyTodoWithRelationQueryResult.from);
  }

  private async findAll(owner: UserId): Promise<DailyTodoWithRelationEntity[]> {
    return await this.dailyTodoQueryPort.findAll(owner);
  }
}
