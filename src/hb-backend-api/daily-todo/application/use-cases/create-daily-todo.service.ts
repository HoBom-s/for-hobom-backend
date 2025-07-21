import { CreateDailyTodoUseCase } from "../ports/in/create-daily-todo.use-case";
import { Inject, Injectable } from "@nestjs/common";
import { DIToken } from "../../../../shared/di/token.di";
import { DailyTodoPersistencePort } from "../ports/out/daily-todo-persistence.port";
import { UserId } from "src/hb-backend-api/user/domain/model/user-id.vo";
import { CreateDailyTodoCommand } from "../command/create-daily-todo.command";
import { DailyTodoCreateEntitySchema } from "../../domain/entity/daily-todo.entity";
import { DailyTodoCompleteStatus } from "../../domain/enums/daily-todo-complete-status.enum";
import { DailyTodoCycle } from "../../domain/enums/daily-todo-cycle.enum";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";

@Injectable()
export class CreateDailyTodoService implements CreateDailyTodoUseCase {
  constructor(
    @Inject(DIToken.DailyTodoModule.DailyTodoPersistencePort)
    private readonly dailyTodoPersistencePort: DailyTodoPersistencePort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(
    command: CreateDailyTodoCommand,
    owner: UserId,
  ): Promise<void> {
    await this.createDailyTodo(command, owner);
  }

  private async createDailyTodo(
    command: CreateDailyTodoCommand,
    owner: UserId,
  ): Promise<void> {
    const dailyTodoCreateEntitySchema = DailyTodoCreateEntitySchema.of(
      command.getTitle,
      command.getDate,
      owner,
      null,
      DailyTodoCompleteStatus.PROGRESS,
      DailyTodoCycle.EVERYDAY,
      command.getCategory,
    );
    await this.dailyTodoPersistencePort.save(dailyTodoCreateEntitySchema);
  }
}
