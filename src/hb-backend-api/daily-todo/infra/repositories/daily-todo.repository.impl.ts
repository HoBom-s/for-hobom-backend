import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DailyTodoDocument } from "../../domain/entity/daily-todo.schema";
import {
  DailyTodoCreateEntitySchema,
  DailyTodoEntity,
} from "../../domain/entity/daily-todo.entity";
import { DailyTodoRepository } from "../../domain/repositories/daily-todo.repository";
import { DailyTodoAggregationHelper } from "../../adapters/out/aggregation/daily-todo-aggregation.helper";
import type { DailyTodoWithRelations } from "../../domain/entity/daily-todo.retations";
import { YearMonthDayString } from "../../domain/vo/year-month-day-string.vo";
import { DateHelper } from "../../../../shared/date/date.helper";
import { DailyTodoId } from "../../domain/vo/daily-todo-id.vo";
import { AggregateQuery } from "../../../../infra/mongo/query/aggregate.query";
import { UserId } from "../../../user/domain/vo/user-id.vo";
import { MongoSessionContext } from "../../../../infra/mongo/transaction/transaction.context";

@Injectable()
export class DailyTodoRepositoryImpl implements DailyTodoRepository {
  private readonly TTL_MS = 30_000;
  private readonly aggregateQuery = AggregateQuery.of<DailyTodoWithRelations>(
    this.TTL_MS,
  );

  constructor(
    @InjectModel(DailyTodoEntity.name)
    private readonly dailyTodoModel: Model<DailyTodoDocument>,
  ) {}

  public async save(
    dailyTodoCreateSchemaEntity: DailyTodoCreateEntitySchema,
  ): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.dailyTodoModel.create(
      [
        {
          title: dailyTodoCreateSchemaEntity.getTitle,
          date: dailyTodoCreateSchemaEntity.getDate,
          owner: dailyTodoCreateSchemaEntity.getOwner.raw,
          reaction: dailyTodoCreateSchemaEntity.getReaction,
          progress: dailyTodoCreateSchemaEntity.getProgress,
          cycle: dailyTodoCreateSchemaEntity.getCycle,
          category: dailyTodoCreateSchemaEntity.getCategory,
        },
      ],
      {
        session: session,
      },
    );
  }

  public async findAll(
    owner: UserId,
    date: YearMonthDayString,
  ): Promise<DailyTodoWithRelations[]> {
    const startOfMonth = DateHelper.startOfMonth(
      DateHelper.parse(date.value, "KST"),
    );
    const endDate = DateHelper.parse(date.value, "KST");
    endDate.setMonth(endDate.getMonth() + 1);
    const endOfMonth = DateHelper.startOfMonth(endDate);

    return this.aggregateQuery.fetchAll(
      `daily-todos:${owner.toString()}:${date.value}`,
      () =>
        this.dailyTodoModel
          .aggregate([
            {
              $match: {
                owner: owner.raw,
                date: { $gte: startOfMonth, $lte: endOfMonth },
              },
            },
            ...DailyTodoAggregationHelper.buildUserJoin(),
            ...DailyTodoAggregationHelper.buildCategoryJoin(),
            ...DailyTodoAggregationHelper.buildProject(),
          ])
          .exec(),
    );
  }

  public async findById(
    id: DailyTodoId,
    owner: UserId,
  ): Promise<DailyTodoWithRelations | null> {
    return this.aggregateQuery.fetch(
      `daily-todo:${id.toString()}:${owner.toString()}`,
      () =>
        this.dailyTodoModel
          .aggregate([
            { $match: { _id: id.raw, owner: owner.raw } },
            ...DailyTodoAggregationHelper.buildUserJoin(),
            ...DailyTodoAggregationHelper.buildCategoryJoin(),
            ...DailyTodoAggregationHelper.buildProject(),
            { $limit: 1 },
          ])
          .exec(),
    );
  }
}
