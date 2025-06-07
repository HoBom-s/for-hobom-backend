import { CreateMenuRecommendationEntity } from "../domain/entity/create-menu-recommendation.entity";
import { MenuRecommendationWithRelationsEntity } from "../domain/entity/menu-recommendation-with-relations.entity";

export interface MenuRecommendationRepository {
  save(entity: CreateMenuRecommendationEntity): Promise<void>;

  findAll(): Promise<MenuRecommendationWithRelationsEntity[]>;
}
