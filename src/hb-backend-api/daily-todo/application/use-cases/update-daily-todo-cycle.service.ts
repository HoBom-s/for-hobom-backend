import { UpdateDailyTodoCycleUseCase } from "../ports/in/update-daily-todo-cycle.use-case";
import { Inject, Injectable } from "@nestjs/common";
import { DIToken } from "../../../../shared/di/token.di";
import { DailyTodoPersistencePort } from "../ports/out/daily-todo-persistence.port";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";
import { UserId } from "src/hb-backend-api/user/domain/model/user-id.vo";
import { DailyTodoId } from "../../domain/vo/daily-todo-id.vo";
import { UpdateDailyTodoCycleCommand } from "../command/update-daily-todo-cycle.command";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";
import { DailyTodoWithRelationEntity } from "../../domain/entity/daily-todo.retations";
import { DailyTodoQueryPort } from "../ports/out/daily-todo-query.port";
import { DailyTodoCycle } from "../../domain/enums/daily-todo-cycle.enum";

@Injectable()
export class UpdateDailyTodoCycleService
  implements UpdateDailyTodoCycleUseCase
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
    command: UpdateDailyTodoCycleCommand,
  ): Promise<void> {
    const dailyTodo = await this.getBy(id, owner);
    await this.changeCycle(
      dailyTodo.getId,
      dailyTodo.getOwner.getId,
      command.getCycle,
    );
  }

  private async getBy(
    id: DailyTodoId,
    owner: UserId,
  ): Promise<DailyTodoWithRelationEntity> {
    return await this.dailyTodoQueryPort.findById(id, owner);
  }

  private async changeCycle(
    id: DailyTodoId,
    owner: UserId,
    cycle: DailyTodoCycle,
  ): Promise<void> {
    await this.dailyTodoPersistencePort.updateDailyTodoCycle(id, owner, cycle);
  }
}
