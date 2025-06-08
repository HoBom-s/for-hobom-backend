import { CreateMenuRecommendationCommand } from "../../command/create-menu-recommendation.command";

export interface CreateMenuRecommendationUseCase {
  invoke(command: CreateMenuRecommendationCommand): Promise<void>;
}
