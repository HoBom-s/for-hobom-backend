import { CreateMenuRecommendationEntity } from "../../domain/model/create-menu-recommendation.entity";
import { MenuRecommendationWithRelationsEntity } from "../../domain/model/menu-recommendation-with-relations.entity";

export interface MenuRecommendationRepository {
  save(entity: CreateMenuRecommendationEntity): Promise<void>;

  findAll(): Promise<MenuRecommendationWithRelationsEntity[]>;
}
