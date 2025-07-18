import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { DailyTodoQueryPort } from "../../../application/ports/out/daily-todo-query.port";
import { DIToken } from "../../../../../shared/di/token.di";
import { DailyTodoRepository } from "../../../domain/repositories/daily-todo.repository";
import { UserId } from "../../../../user/domain/model/user-id.vo";
import {
  Category,
  DailyTodoWithRelationEntity,
  type DailyTodoWithRelations,
  Owner,
  Reaction,
} from "../../../domain/entity/daily-todo.retations";
import { CategoryId } from "../../../../category/domain/model/category-id.vo";
import { DailyTodoId } from "../../../domain/vo/daily-todo-id.vo";
import { YearMonthDayString } from "../../../domain/vo/year-month-day-string.vo";

@Injectable()
export class DailyTodoQueryAdapter implements DailyTodoQueryPort {
  constructor(
    @Inject(DIToken.DailyTodoModule.DailyTodoRepository)
    private readonly dailyTodoRepository: DailyTodoRepository,
  ) {}

  public async findAll(
    owner: UserId,
    date: YearMonthDayString,
  ): Promise<DailyTodoWithRelationEntity[]> {
    const dailyTodos = await this.dailyTodoRepository.findAll(owner, date);

    return dailyTodos.map(this.toRelationEntity);
  }

  public async findById(
    id: DailyTodoId,
    owner: UserId,
  ): Promise<DailyTodoWithRelationEntity> {
    const dailyTodo = await this.dailyTodoRepository.findById(id, owner);
    if (dailyTodo == null) {
      throw new NotFoundException(
        `해당하는 데일리 투두가 없어요. ID: ${id.toString()}`,
      );
    }

    return this.toRelationEntity(dailyTodo);
  }

  public async findByDate(
    owner: UserId,
    date: YearMonthDayString,
  ): Promise<DailyTodoWithRelationEntity[]> {
    const dailyTodos = await this.dailyTodoRepository.findByDate(owner, date);

    return dailyTodos.map(this.toRelationEntity);
  }

  private toRelationEntity(
    dailyTodo: DailyTodoWithRelations,
  ): DailyTodoWithRelationEntity {
    return DailyTodoWithRelationEntity.of(
      DailyTodoId.fromString(dailyTodo._id),
      dailyTodo.title,
      dailyTodo.date,
      dailyTodo.reaction == null
        ? null
        : Reaction.of(
            dailyTodo.reaction.value,
            UserId.fromString(dailyTodo.reaction.reactionUserId),
          ),
      dailyTodo.progress,
      dailyTodo.cycle,
      Owner.of(
        UserId.fromString(dailyTodo.owner.id),
        dailyTodo.owner.username,
        dailyTodo.owner.nickname,
      ),
      Category.of(
        CategoryId.fromString(dailyTodo.category.id),
        dailyTodo.category.title,
      ),
    );
  }
}
