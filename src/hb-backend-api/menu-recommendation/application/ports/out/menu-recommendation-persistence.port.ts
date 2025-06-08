import { CreateMenuRecommendationEntity } from "../../../domain/entity/create-menu-recommendation.entity";

export interface MenuRecommendationPersistencePort {
  save(entity: CreateMenuRecommendationEntity): Promise<void>;
}
