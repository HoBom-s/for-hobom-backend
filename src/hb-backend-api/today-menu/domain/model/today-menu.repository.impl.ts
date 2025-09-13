import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { TodayMenuRepository } from "../../infra/today-menu.repository";
import { TodayMenuDocument } from "./today-menu.schema";
import { TodayMenuEntity } from "./today-menu.entity";
import { UpsertTodayMenuEntity } from "./upsert-today-menu.entity";
import { MongoSessionContext } from "../../../../infra/mongo/transaction/transaction.context";
import { TodayMenuId } from "./today-menu.vo";
import { TodayMenuWithRelationsEntity } from "./today-menu-with-relations.entity";
import { TodayMenuAggregator } from "../today-menu-aggregator.helper";

@Injectable()
export class TodayMenuRepositoryImpl implements TodayMenuRepository {
  constructor(
    @InjectModel(TodayMenuEntity.name)
    private readonly todayMenuModel: Model<TodayMenuDocument>,
  ) {}

  public async upsert(entity: UpsertTodayMenuEntity): Promise<TodayMenuId> {
    const session = MongoSessionContext.getSession();
    const id = entity.getTodayMenuId?.raw;

    if (id == null) {
      const [todayMenuDocument] = await this.todayMenuModel.create(
        [
          {
            recommendedMenu:
              entity.getRecommendedMenu?.raw == null
                ? null
                : entity.getRecommendedMenu.raw,
            candidates: entity.getCandidates.map((c) => c.raw),
            recommendationDate:
              entity.getRecommendationDate == null
                ? null
                : entity.getRecommendationDate.value,
          },
        ],
        {
          session: session,
        },
      );

      return TodayMenuId.fromSting(String(todayMenuDocument._id));
    } else {
      const todayMenuDocument = await this.todayMenuModel.findOneAndUpdate(
        {
          _id: id,
        },
        {
          $set: {
            recommendedMenu:
              entity.getRecommendedMenu?.raw == null
                ? null
                : entity.getRecommendedMenu.raw,
            candidates: entity.getCandidates.map((item) => item.raw),
            recommendationDate:
              entity.getRecommendationDate == null
                ? null
                : entity.getRecommendationDate.value,
          },
        },
        {
          upsert: true,
          setDefaultsOnInsert: true,
          new: true,
          session: session,
        },
      );

      return TodayMenuId.fromSting(String(todayMenuDocument._id));
    }
  }

  public async findById(
    id: TodayMenuId,
  ): Promise<TodayMenuWithRelationsEntity> {
    const result = await this.todayMenuModel
      .aggregate([
        { $match: { _id: id.raw } },
        ...TodayMenuAggregator.buildPipeline(),
        { $limit: 1 },
      ])
      .exec();

    return result[0];
  }

  public async findRecommendedMenuById(
    id: TodayMenuId,
  ): Promise<TodayMenuWithRelationsEntity> {
    const result = await this.todayMenuModel
      .aggregate([
        {
          $match: {
            recommendedMenu: id.raw,
          },
        },
        ...TodayMenuAggregator.buildPipeline(),
      ])
      .exec();
    if (!result.length) {
      throw new NotFoundException(
        `TodayMenu recommended by ${id.toString()} not found`,
      );
    }

    return result[0];
  }
}
