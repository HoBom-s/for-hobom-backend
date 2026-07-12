import { Inject, Injectable } from "@nestjs/common";
import { UpdateDailyTodoUseCase } from "../ports/in/update-daily-todo.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { DailyTodoPersistencePort } from "../ports/out/daily-todo-persistence.port";
import { DailyTodoQueryPort } from "../ports/out/daily-todo-query.port";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";
import { DailyTodoId } from "../../domain/vo/daily-todo-id.vo";
import { UserId } from "src/hb-backend-api/user/domain/model/user-id.vo";
import { UpdateDailyTodoCommand } from "../command/update-daily-todo.command";

@Injectable()
export class UpdateDailyTodoService implements UpdateDailyTodoUseCase {
  constructor(
    @Inject(DIToken.DailyTodoModule.DailyTodoPersistencePort)
    private readonly dailyTodoPersistencePort: DailyTodoPersistencePort,
    @Inject(DIToken.DailyTodoModule.DailyTodoQueryPort)
    private readonly dailyTodoQueryPort: DailyTodoQueryPort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(
    id: DailyTodoId,
    owner: UserId,
    command: UpdateDailyTodoCommand,
  ): Promise<void> {
    const dailyTodo = await this.dailyTodoQueryPort.findById(id, owner);
    const data: Record<string, unknown> = {};

    if (command.getTitle !== undefined) {
      data.title = command.getTitle;
    }
    if (command.getDate !== undefined) {
      data.date = command.getDate;
    }
    if (command.getCategory !== undefined) {
      data.category = command.getCategory;
    }

    if (Object.keys(data).length > 0) {
      await this.dailyTodoPersistencePort.update(
        dailyTodo.getId,
        dailyTodo.getOwner.getId,
        data,
      );
    }
  }
}
