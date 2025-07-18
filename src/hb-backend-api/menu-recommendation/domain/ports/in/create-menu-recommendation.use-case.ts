import { CreateMenuRecommendationCommand } from "../out/create-menu-recommendation.command";

export interface CreateMenuRecommendationUseCase {
  invoke(command: CreateMenuRecommendationCommand): Promise<void>;
}
