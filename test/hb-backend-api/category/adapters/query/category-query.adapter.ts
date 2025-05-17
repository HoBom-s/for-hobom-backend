import { Types } from "mongoose";
import { CategoryRepository } from "../../../../../src/hb-backend-api/category/domain/repositories/category.repository";
import { createCategoryRepository } from "../../../../mocks/category.repository.mock";
import { CategoryQueryAdapter } from "../../../../../src/hb-backend-api/category/adapters/out/query/category-query.adapter";
import { createMockCategory } from "../../../../factories/category.factory";
import { CategoryId } from "../../../../../src/hb-backend-api/category/domain/vo/category-id.vo";
import { CategoryEntitySchema } from "../../../../../src/hb-backend-api/category/domain/entity/category.entity";
import { CategoryTitle } from "../../../../../src/hb-backend-api/category/domain/vo/category-title.vo";

describe("CategoryQueryAdapter", () => {
  let categoryRepository: jest.Mocked<CategoryRepository>;
  let categoryQueryAdapter: CategoryQueryAdapter;

  beforeEach(() => {
    categoryRepository = createCategoryRepository();
    categoryQueryAdapter = new CategoryQueryAdapter(categoryRepository);
  });

  describe("findById()", () => {
    it("should return a CategoryEntitySchema when category id found by categoryId", async () => {
      const foundCategory = createMockCategory();

      categoryRepository.findById.mockResolvedValue(foundCategory);

      const categoryId = new CategoryId(new Types.ObjectId());
      const result = await categoryQueryAdapter.findById(categoryId);

      expect(categoryRepository.findById).toHaveBeenCalledWith(categoryId);
      expect(result).toBeInstanceOf(CategoryEntitySchema);
      expect(result).toMatchObject({
        title: "Category",
        dailyTodos: [],
      });
    });
  });

  describe("getByTitle()", () => {
    it("if existed title should return a CategoryEntitySchema when category id found by categoryId", async () => {
      const foundCategory = createMockCategory();

      categoryRepository.findByTitle.mockResolvedValue(foundCategory);

      const title = CategoryTitle.fromString("Category");
      const result = await categoryQueryAdapter.getByTitle(title);

      expect(categoryRepository.findById).toHaveBeenCalledWith(title);
      expect(result).toBeInstanceOf(CategoryEntitySchema);
      expect(result).toMatchObject({
        title: "Category",
        dailyTodos: [],
      });

      const notExistTitle = CategoryTitle.fromString("Noooo");
      expect(categoryQueryAdapter.getByTitle(notExistTitle)).toBeNull();
    });
  });
});
