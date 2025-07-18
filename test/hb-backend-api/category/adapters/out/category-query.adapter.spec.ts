import { Types } from "mongoose";
import { CategoryRepository } from "../../../../../src/hb-backend-api/category/domain/model/category.repository";
import { createCategoryRepository } from "../../../../mocks/category.repository.mock";
import { CategoryQueryAdapter } from "../../../../../src/hb-backend-api/category/adapters/out/category-query.adapter";
import { createMockCategory } from "../../../../factories/category.factory";
import { CategoryId } from "../../../../../src/hb-backend-api/category/domain/model/category-id.vo";
import { CategoryEntitySchema } from "../../../../../src/hb-backend-api/category/domain/model/category.entity";
import { CategoryTitle } from "../../../../../src/hb-backend-api/category/domain/model/category-title.vo";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";

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
      const userId = new UserId(new Types.ObjectId());
      const result = await categoryQueryAdapter.findById(categoryId, userId);

      expect(categoryRepository.findById).toHaveBeenCalledWith(
        categoryId,
        userId,
      );
      expect(result).toBeInstanceOf(CategoryEntitySchema);
      expect(result).toMatchObject({
        title: CategoryTitle.fromString("Category"),
        dailyTodos: [],
      });
    });
  });

  describe("findByTitle()", () => {
    it("if existed title should return a CategoryEntitySchema when category id found by categoryId", async () => {
      const foundCategory = createMockCategory();

      categoryRepository.findByTitle.mockResolvedValue(foundCategory);

      const title = CategoryTitle.fromString("Category");
      const userId = new UserId(new Types.ObjectId());
      const result = await categoryQueryAdapter.findByTitle(title, userId);

      expect(categoryRepository.findByTitle).toHaveBeenCalledWith(
        title,
        userId,
      );
      expect(result).toBeInstanceOf(CategoryEntitySchema);
      expect(result).toMatchObject({
        title: CategoryTitle.fromString("Category"),
        dailyTodos: [],
      });

      const notExistTitle = CategoryTitle.fromString("Noooo");
      categoryRepository.findByTitle.mockResolvedValue(null as any);
      expect(
        await categoryQueryAdapter.findByTitle(notExistTitle, userId),
      ).toBeNull();
    });
  });
});
