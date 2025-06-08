import { MenuRecommendationRelationEntity } from "../../../domain/entity/menu-recommendation-with-relations.entity";

export interface MenuRecommendationQueryPort {
  findAll(): Promise<MenuRecommendationRelationEntity[]>;
}
