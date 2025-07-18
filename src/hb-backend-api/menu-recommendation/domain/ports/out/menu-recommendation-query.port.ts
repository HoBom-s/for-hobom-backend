import { MenuRecommendationRelationEntity } from "../../model/menu-recommendation-with-relations.entity";

export interface MenuRecommendationQueryPort {
  findAll(): Promise<MenuRecommendationRelationEntity[]>;
}
