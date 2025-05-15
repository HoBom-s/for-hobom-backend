import { CategoryRepository } from "../../src/hb-backend-api/category/domain/repositories/category.repository";

export function createCategoryRepository(): jest.Mocked<CategoryRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    findByTitle: jest.fn(),
  };
}
