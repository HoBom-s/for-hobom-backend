import { GetMenuRecommendationQueryResult } from "../../result/get-menu-recommendation-query.result";

export interface FindAllMenuRecommendationUseCase {
  invoke(): Promise<GetMenuRecommendationQueryResult[]>;
}
