import { UserId } from "src/hb-backend-api/user/domain/model/user-id.vo";
import { DailyTodoId } from "../../domain/vo/daily-todo-id.vo";
import { UpdateDailyTodoCompleteStatusCommand } from "../command/update-daily-todo-complete-status.command";
import { UpdateDailyTodoCompleteStatusUseCase } from "../ports/in/update-daily-todo-complete-status.use-case";
import { Inject, Injectable } from "@nestjs/common";
import { DailyTodoPersistenceAdapter } from "../../adapters/out/persistence/daily-todo-persistence.adapter";
import { DIToken } from "../../../../shared/di/token.di";
import { DailyTodoQueryPort } from "../ports/out/daily-todo-query.port";
import { DailyTodoWithRelationEntity } from "../../domain/entity/daily-todo.retations";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";

@Injectable()
export class UpdateDailyTodoCompleteStatusService
  implements UpdateDailyTodoCompleteStatusUseCase
{
  constructor(
    @Inject(DIToken.DailyTodoModule.DailyTodoPersistencePort)
    private readonly dailyTodoPersistencePort: DailyTodoPersistenceAdapter,
    @Inject(DIToken.DailyTodoModule.DailyTodoQueryPort)
    private readonly dailyTodoQueryPort: DailyTodoQueryPort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(
    id: DailyTodoId,
    owner: UserId,
    command: UpdateDailyTodoCompleteStatusCommand,
  ): Promise<void> {
    const dailyTodo = await this.getBy(id, owner);
    await this.changeCompleteStatus(
      dailyTodo.getId,
      dailyTodo.getOwner.getId,
      command,
    );
  }

  private async getBy(
    id: DailyTodoId,
    owner: UserId,
  ): Promise<DailyTodoWithRelationEntity> {
    return await this.dailyTodoQueryPort.findById(id, owner);
  }

  private async changeCompleteStatus(
    id: DailyTodoId,
    owner: UserId,
    command: UpdateDailyTodoCompleteStatusCommand,
  ): Promise<void> {
    await this.dailyTodoPersistencePort.updateDailyTodoCompleteStatus(
      id,
      owner,
      command.getStatus,
    );
  }
}
