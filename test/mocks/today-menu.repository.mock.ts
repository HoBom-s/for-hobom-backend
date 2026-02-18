import { TodayMenuRepository } from "../../src/hb-backend-api/today-menu/infra/today-menu.repository";

export function createTodayMenuRepository(): jest.Mocked<TodayMenuRepository> {
  return {
    upsert: jest.fn(),
    findById: jest.fn(),
    findRecommendedMenuById: jest.fn(),
  };
}
