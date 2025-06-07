import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { TodayMenuRepository } from "../../infra/today-menu.repository";
import { TodayMenuDocument } from "../entity/today-menu.schema";
import { TodayMenuEntity } from "../entity/today-menu.entity";
import { UpsertTodayMenuEntity } from "../entity/upsert-today-menu.entity";
import { MongoSessionContext } from "../../../../infra/mongo/transaction/transaction.context";

@Injectable()
export class TodayMenuRepositoryImpl implements TodayMenuRepository {
  constructor(
    @InjectModel(TodayMenuEntity.name)
    private readonly todayMenuModal: Model<TodayMenuDocument>,
  ) {}

  public async upsert(entity: UpsertTodayMenuEntity): Promise<void> {
    const session = MongoSessionContext.getSession();
    const id = entity.getTodayMenuId?.raw;

    if (id == null) {
      await this.todayMenuModal.create(
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
    } else {
      await this.todayMenuModal.findOneAndUpdate(
        {
          _id: id,
        },
        {
          $set: {
            recommendedMenu:
              entity.getRecommendedMenu?.raw == null
                ? null
                : entity.getRecommendedMenu.raw,
            candidates: entity.getCandidates,
            recommendationDate:
              entity.getRecommendationDate == null
                ? null
                : entity.getRecommendationDate.value,
          },
        },
        {
          upsert: true,
          setDefaultsOnInsert: true,
          session: session,
        },
      );
    }
  }
}
