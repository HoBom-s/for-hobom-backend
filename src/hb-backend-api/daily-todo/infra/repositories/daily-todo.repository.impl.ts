import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DailyTodoDocument } from "../../domain/entity/daily-todo.schema";
import {
  DailyTodoCreateEntitySchema,
  DailyTodoEntity,
} from "../../domain/entity/daily-todo.entity";
import { DailyTodoRepository } from "../../domain/repositories/daily-todo.repository";

@Injectable()
export class DailyTodoRepositoryImpl implements DailyTodoRepository {
  constructor(
    @InjectModel(DailyTodoEntity.name)
    private readonly dailyTodoModel: Model<DailyTodoDocument>,
  ) {}

  public async save(
    dailyTodoCreateSchemaEntity: DailyTodoCreateEntitySchema,
  ): Promise<void> {
    await this.dailyTodoModel.create({
      title: dailyTodoCreateSchemaEntity.getTitle,
      date: dailyTodoCreateSchemaEntity.getDate,
      owner: dailyTodoCreateSchemaEntity.getOwner.raw,
      reaction: dailyTodoCreateSchemaEntity.getReaction,
      progress: dailyTodoCreateSchemaEntity.getProgress,
      cycle: dailyTodoCreateSchemaEntity.getCycle,
      categoryId: dailyTodoCreateSchemaEntity.getCategory,
    });
  }
}
