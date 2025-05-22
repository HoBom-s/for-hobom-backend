import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DailyTodoDocument } from "../../domain/entity/daily-todo.schema";
import {
  DailyTodoCreateEntitySchema,
  DailyTodoEntity,
} from "../../domain/entity/daily-todo.entity";
import { DailyTodoRepository } from "../../domain/repositories/daily-todo.repository";
import { UserId } from "src/hb-backend-api/user/domain/vo/user-id.vo";
import { DailyTodoAggregationHelper } from "../../adapters/out/aggregation/daily-todo-aggregation.helper";
import type { DailyTodoWithRelations } from "../../domain/entity/daily-todo.retations";

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
      category: dailyTodoCreateSchemaEntity.getCategory,
    });
  }

  public async findAll(owner: UserId): Promise<DailyTodoWithRelations[]> {
    const dailyTodos = await this.dailyTodoModel
      .aggregate([
        {
          $match: {
            owner: owner.raw,
          },
        },
        ...DailyTodoAggregationHelper.buildUserJoin(),
        ...DailyTodoAggregationHelper.buildCategoryJoin(),
        {
          $project: {
            id: "$_id",
            title: 1,
            date: 1,
            reaction: 1,
            progress: 1,
            cycle: 1,
            owner: {
              id: "$owner._id",
              username: "$owner.username",
              nickname: "$owner.nickname",
            },
            category: {
              id: "$category._id",
              title: "$category.title",
            },
          },
        },
      ])
      .exec();
    if (dailyTodos == null) {
      return [];
    }

    return dailyTodos;
  }
}
