import { DeleteDailyTodoUseCase } from "../ports/in/delete-daily-todo.use-case";
import { Inject } from "@nestjs/common";
import { DIToken } from "../../../../shared/di/token.di";
import { DailyTodoPersistencePort } from "../ports/out/daily-todo-persistence.port";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { UserId } from "src/hb-backend-api/user/domain/model/user-id.vo";
import { DailyTodoId } from "../../domain/vo/daily-todo-id.vo";
import { DailyTodoQueryPort } from "../ports/out/daily-todo-query.port";
import { DailyTodoWithRelationEntity } from "../../domain/entity/daily-todo.retations";

export class DeleteDailyTodoService implements DeleteDailyTodoUseCase {
  constructor(
    @Inject(DIToken.DailyTodoModule.DailyTodoPersistencePort)
    private readonly dailyTodoPersistencePort: DailyTodoPersistencePort,
    @Inject(DIToken.DailyTodoModule.DailyTodoQueryPort)
    private readonly dailyTodoQueryPort: DailyTodoQueryPort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  public async invoke(id: DailyTodoId, owner: UserId): Promise<void> {
    const dailyTodo = await this.getBy(id, owner);
    await this.deleteDailyTodo(dailyTodo.getId, dailyTodo.getOwner.getId);
  }

  private async getBy(
    id: DailyTodoId,
    owner: UserId,
  ): Promise<DailyTodoWithRelationEntity> {
    return await this.dailyTodoQueryPort.findById(id, owner);
  }

  private async deleteDailyTodo(id: DailyTodoId, owner: UserId): Promise<void> {
    await this.dailyTodoPersistencePort.deleteDailyTodoById(id, owner);
  }
}
