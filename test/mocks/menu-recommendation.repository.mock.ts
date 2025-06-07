import { MenuRecommendationRepository } from "../../src/hb-backend-api/menu-recommendation/infra/menu-recommendation.repository";

export function createMenuRecommendationRepository(): jest.Mocked<MenuRecommendationRepository> {
  return {
    save: jest.fn(),
    findAll: jest.fn(),
  };
}
