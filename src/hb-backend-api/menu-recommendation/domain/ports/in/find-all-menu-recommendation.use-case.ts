import { GetMenuRecommendationQueryResult } from "../out/get-menu-recommendation-query.result";

export interface FindAllMenuRecommendationUseCase {
  invoke(): Promise<GetMenuRecommendationQueryResult[]>;
}
