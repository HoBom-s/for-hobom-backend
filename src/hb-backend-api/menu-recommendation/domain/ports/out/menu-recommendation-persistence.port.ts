import { CreateMenuRecommendationEntity } from "../../model/create-menu-recommendation.entity";

export interface MenuRecommendationPersistencePort {
  save(entity: CreateMenuRecommendationEntity): Promise<void>;
}
