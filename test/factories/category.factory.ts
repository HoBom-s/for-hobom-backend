import { CategoryDocument } from "../../src/hb-backend-api/category/domain/model/category.schema";

export function createMockCategory(
  overrides: Partial<CategoryDocument> = {},
): CategoryDocument {
  return {
    _id: "6825f6a155f17284810680ed",
    title: "Category",
    owner: "681c1ebc9481a8b5148f5155",
    dailyTodos: [],
    ...overrides,
  } as CategoryDocument;
}
