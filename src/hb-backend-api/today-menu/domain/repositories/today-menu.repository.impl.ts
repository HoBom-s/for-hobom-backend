import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { TodayMenuRepository } from "../../infra/today-menu.repository";
import { TodayMenuDocument } from "../entity/today-menu.schema";
import { TodayMenuEntity } from "../entity/today-menu.entity";
import { UpsertTodayMenuEntity } from "../entity/upsert-today-menu.entity";
import { MongoSessionContext } from "../../../../infra/mongo/transaction/transaction.context";
import { TodayMenuId } from "../vo/today-menu.vo";
import { TodayMenuWithRelationsEntity } from "../entity/today-menu-with-relations.entity";
import { TodayMenuAggregator } from "../../adapters/out/aggregator/today-menu-aggregator.helper";

@Injectable()
export class TodayMenuRepositoryImpl implements TodayMenuRepository {
  constructor(
    @InjectModel(TodayMenuEntity.name)
    private readonly todayMenuModal: Model<TodayMenuDocument>,
  ) {}

  public async upsert(entity: UpsertTodayMenuEntity): Promise<TodayMenuId> {
    const session = MongoSessionContext.getSession();
    const id = entity.getTodayMenuId?.raw;

    if (id == null) {
      const [todayMenuDocument] = await this.todayMenuModal.create(
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
      const todayMenuDocument = await this.todayMenuModal.findOneAndUpdate(
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
    const result = await this.todayMenuModal
      .aggregate([
        { $match: { _id: id.raw } },
        ...TodayMenuAggregator.buildPipeline(),
        { $limit: 1 },
      ])
      .exec();

    return result[0];
  }
}
