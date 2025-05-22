import { Inject, Injectable } from "@nestjs/common";
import { DailyTodoQueryPort } from "../../../application/ports/out/daily-todo-query.port";
import { DIToken } from "../../../../../shared/di/token.di";
import { DailyTodoRepository } from "../../../domain/repositories/daily-todo.repository";
import { UserId } from "../../../../user/domain/vo/user-id.vo";
import {
  Category,
  DailyTodoWithRelationEntity,
  type DailyTodoWithRelations,
  Owner,
} from "../../../domain/entity/daily-todo.retations";
import { CategoryId } from "../../../../category/domain/vo/category-id.vo";
import { DailyTodoId } from "../../../domain/vo/daily-todo-id.vo";
import { ObjectHelper } from "../../../../../shared/object/object.helper";
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

  private toRelationEntity(
    dailyTodo: DailyTodoWithRelations,
  ): DailyTodoWithRelationEntity {
    return DailyTodoWithRelationEntity.of(
      DailyTodoId.fromString(dailyTodo._id),
      dailyTodo.title,
      dailyTodo.date,
      dailyTodo.reaction,
      dailyTodo.progress,
      dailyTodo.cycle,
      Owner.of(
        UserId.fromString(dailyTodo.owner.id),
        dailyTodo.owner.username,
        dailyTodo.owner.nickname,
      ),
      dailyTodo.category == null
        ? null
        : ObjectHelper.isEmpty(dailyTodo?.category)
          ? null
          : Category.of(
              CategoryId.fromString(dailyTodo.category.id),
              dailyTodo.category.title,
            ),
    );
  }
}
