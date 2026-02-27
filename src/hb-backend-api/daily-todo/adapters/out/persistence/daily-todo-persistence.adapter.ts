import { Inject, Injectable } from "@nestjs/common";
import { DailyTodoPersistencePort } from "../../../application/ports/out/daily-todo-persistence.port";
import { DIToken } from "../../../../../shared/di/token.di";
import { DailyTodoRepository } from "../../../domain/repositories/daily-todo.repository";
import { DailyTodoCreateEntitySchema } from "src/hb-backend-api/daily-todo/domain/entity/daily-todo.entity";
import { DailyTodoCompleteStatus } from "src/hb-backend-api/daily-todo/domain/enums/daily-todo-complete-status.enum";
import { DailyTodoCycle } from "src/hb-backend-api/daily-todo/domain/enums/daily-todo-cycle.enum";
import { DailyTodoId } from "src/hb-backend-api/daily-todo/domain/vo/daily-todo-id.vo";
import { UserId } from "src/hb-backend-api/user/domain/model/user-id.vo";
import { CategoryId } from "src/hb-backend-api/category/domain/model/category-id.vo";
import { Reaction } from "../../../domain/entity/daily-todo.retations";

@Injectable()
export class DailyTodoPersistenceAdapter implements DailyTodoPersistencePort {
  constructor(
    @Inject(DIToken.DailyTodoModule.DailyTodoRepository)
    private readonly dailyTodoRepository: DailyTodoRepository,
  ) {}

  public async save(
    dailyTodoCreateEntitySchema: DailyTodoCreateEntitySchema,
  ): Promise<void> {
    await this.dailyTodoRepository.save(dailyTodoCreateEntitySchema);
  }

  public async saveAll(entities: DailyTodoCreateEntitySchema[]): Promise<void> {
    await this.dailyTodoRepository.saveAll(entities);
  }

  public async findByDateRangeAndCycles(
    startDate: Date,
    endDate: Date,
    cycles: DailyTodoCycle[],
  ): Promise<
    {
      title: string;
      owner: UserId;
      category: CategoryId;
      cycle: DailyTodoCycle;
    }[]
  > {
    return this.dailyTodoRepository.findByDateRangeAndCycles(
      startDate,
      endDate,
      cycles,
    );
  }

  public async updateDailyTodoCompleteStatus(
    id: DailyTodoId,
    owner: UserId,
    progress: DailyTodoCompleteStatus,
  ): Promise<void> {
    await this.dailyTodoRepository.updateDailyTodoCompleteStatus(
      id,
      owner,
      progress,
    );
  }

  public async updateDailyTodoCycle(
    id: DailyTodoId,
    owner: UserId,
    cycle: DailyTodoCycle,
  ): Promise<void> {
    await this.dailyTodoRepository.updateDailyTodoCycle(id, owner, cycle);
  }

  public async updateDailyTodoReaction(
    id: DailyTodoId,
    owner: UserId,
    reaction: Reaction,
  ): Promise<void> {
    await this.dailyTodoRepository.updateDailyTodoReaction(id, owner, reaction);
  }

  public async update(
    id: DailyTodoId,
    owner: UserId,
    data: Record<string, unknown>,
  ): Promise<void> {
    await this.dailyTodoRepository.update(id, owner, data);
  }

  public async deleteDailyTodoById(
    id: DailyTodoId,
    owner: UserId,
  ): Promise<void> {
    await this.dailyTodoRepository.deleteDailyTodoById(id, owner);
  }
}
