import { GetAllDailyTodoUseCase } from "../ports/in/get-all-daily-todo.use-case";
import { Inject, Injectable } from "@nestjs/common";
import { DIToken } from "../../../../shared/di/token.di";
import { DailyTodoQueryPort } from "../ports/out/daily-todo-query.port";
import { DailyTodoWithRelationEntity } from "../../domain/entity/daily-todo.retations";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { DailyTodoWithRelationQueryResult } from "../result/daily-todo-query.result";
import { YearMonthDayString } from "../../domain/vo/year-month-day-string.vo";

@Injectable()
export class GetAllDailyTodoService implements GetAllDailyTodoUseCase {
  constructor(
    @Inject(DIToken.DailyTodoModule.DailyTodoQueryPort)
    private readonly dailyTodoQueryPort: DailyTodoQueryPort,
  ) {}

  public async invoke(
    owner: UserId,
    date: YearMonthDayString,
  ): Promise<DailyTodoWithRelationQueryResult[]> {
    const dailyTodos = await this.findAll(owner, date);

    return dailyTodos.map(DailyTodoWithRelationQueryResult.from);
  }

  private async findAll(
    owner: UserId,
    date: YearMonthDayString,
  ): Promise<DailyTodoWithRelationEntity[]> {
    return await this.dailyTodoQueryPort.findAll(owner, date);
  }
}
