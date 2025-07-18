import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MenuRecommendationRepository } from "../../infra/repositories/menu-recommendation.repository";
import { CreateMenuRecommendationEntity } from "./create-menu-recommendation.entity";
import { MenuRecommendationDocument } from "./menu-recommendation.schema";
import { MenuRecommendationEntity } from "./menu-recommendation.entity";
import { MongoSessionContext } from "../../../../infra/mongo/transaction/transaction.context";
import { MenuRecommendationWithRelationsEntity } from "./menu-recommendation-with-relations.entity";
import { MenuRecommendationAggregationHelper } from "./menu-recommendation-aggregation.helper";

@Injectable()
export class MenuRecommendationRepositoryImpl
  implements MenuRecommendationRepository
{
  constructor(
    @InjectModel(MenuRecommendationEntity.name)
    private readonly menuRecommendationModel: Model<MenuRecommendationDocument>,
  ) {}

  public async save(entity: CreateMenuRecommendationEntity): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.menuRecommendationModel.create(
      [
        {
          name: entity.getName,
          menuKind: entity.getMenuKind,
          timeOfMeal: entity.getTimeOfMeal,
          foodType: entity.getFoodType,
          registerPerson: entity.getRegisterPerson.raw,
        },
      ],
      {
        session: session,
      },
    );
  }

  public async findAll(): Promise<MenuRecommendationWithRelationsEntity[]> {
    return await this.menuRecommendationModel
      .aggregate([
        ...MenuRecommendationAggregationHelper.buildUserJoin(),
        ...MenuRecommendationAggregationHelper.buildProject(),
      ])
      .exec();
  }
}
