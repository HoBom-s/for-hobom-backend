import { Inject, Injectable } from "@nestjs/common";
import { UpdateDailyTodoReactionUseCase } from "../ports/in/update-daily-todo-reaction.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { DailyTodoPersistencePort } from "../ports/out/daily-todo-persistence.port";
import { UserId } from "src/hb-backend-api/user/domain/vo/user-id.vo";
import { DailyTodoId } from "../../domain/vo/daily-todo-id.vo";
import { UpdateDailyTodoReactionCommand } from "../command/update-daily-todo-reaction.command";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";
import { DailyTodoQueryPort } from "../ports/out/daily-todo-query.port";
import { DailyTodoWithRelationEntity } from "../../domain/entity/daily-todo.retations";

@Injectable()
export class UpdateDailyTodoReactionService
  implements UpdateDailyTodoReactionUseCase
{
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
    command: UpdateDailyTodoReactionCommand,
  ): Promise<void> {
    const dailyTodo = await this.getBy(id, owner);
    await this.updateReaction(
      dailyTodo.getId,
      dailyTodo.getOwner.getId,
      command.getReaction,
    );
  }

  private async getBy(
    id: DailyTodoId,
    owner: UserId,
  ): Promise<DailyTodoWithRelationEntity> {
    return await this.dailyTodoQueryPort.findById(id, owner);
  }

  private async updateReaction(
    id: DailyTodoId,
    owner: UserId,
    reaction: string,
  ): Promise<void> {
    await this.dailyTodoPersistencePort.updateDailyTodoReaction(
      id,
      owner,
      reaction,
    );
  }
}
