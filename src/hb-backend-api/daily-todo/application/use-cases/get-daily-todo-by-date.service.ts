import { GetDailyTodoByDateUseCase } from "../ports/in/get-daily-todo-by-date.use-case";
import { Inject, Injectable } from "@nestjs/common";
import { DIToken } from "../../../../shared/di/token.di";
import { DailyTodoQueryPort } from "../ports/out/daily-todo-query.port";
import { UserId } from "src/hb-backend-api/user/domain/model/user-id.vo";
import { YearMonthDayString } from "../../domain/vo/year-month-day-string.vo";
import { DailyTodoWithRelationQueryResult } from "../result/daily-todo-query.result";
import { DailyTodoWithRelationEntity } from "../../domain/entity/daily-todo.retations";

@Injectable()
export class GetDailyTodoByDateService implements GetDailyTodoByDateUseCase {
  constructor(
    @Inject(DIToken.DailyTodoModule.DailyTodoQueryPort)
    private readonly dailyTodoQueryPort: DailyTodoQueryPort,
  ) {}

  public async invoke(
    owner: UserId,
    date: YearMonthDayString,
  ): Promise<DailyTodoWithRelationQueryResult[]> {
    const dailyTodos = await this.getBy(owner, date);

    return dailyTodos.map(DailyTodoWithRelationQueryResult.from);
  }

  private async getBy(
    owner: UserId,
    date: YearMonthDayString,
  ): Promise<DailyTodoWithRelationEntity[]> {
    return await this.dailyTodoQueryPort.findByDate(owner, date);
  }
}
