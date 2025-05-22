import { Inject, Injectable } from "@nestjs/common";
import { DailyTodoPersistencePort } from "../../../application/ports/out/daily-todo-persistence.port";
import { DIToken } from "../../../../../shared/di/token.di";
import { DailyTodoRepository } from "../../../domain/repositories/daily-todo.repository";
import { DailyTodoCreateEntitySchema } from "src/hb-backend-api/daily-todo/domain/entity/daily-todo.entity";

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
}
