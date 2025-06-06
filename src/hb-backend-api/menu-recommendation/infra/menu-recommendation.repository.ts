import { CreateMenuRecommendationEntity } from "../domain/entity/create-menu-recommendation.entity";

export interface MenuRecommendationRepository {
  save(entity: CreateMenuRecommendationEntity): Promise<void>;
}
