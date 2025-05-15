import { Types } from "mongoose";
import { createCategoryRepository } from "../../../../../mocks/category.repository.mock";
import { CategoryRepository } from "../../../../../../src/hb-backend-api/category/domain/repositories/category.repository";
import { CategoryPersistenceAdapter } from "../../../../../../src/hb-backend-api/category/adapters/out/persistence/category-persistence.adapter";
import { CategoryCreateEntitySchema } from "../../../../../../src/hb-backend-api/category/domain/entity/category.entity";
import { UserId } from "../../../../../../src/hb-backend-api/user/domain/vo/user-id.vo";

describe("CategoryPersistenceAdapter", () => {
  let categoryRepository: jest.Mocked<CategoryRepository>;
  let categoryPersistenceAdapter: CategoryPersistenceAdapter;

  beforeEach(() => {
    categoryRepository = createCategoryRepository();
    categoryPersistenceAdapter = new CategoryPersistenceAdapter(
      categoryRepository,
    );
  });

  describe("save", () => {
    it("should call categoryRepository.save with the given category", async () => {
      const userId = new UserId(new Types.ObjectId());
      const category = new CategoryCreateEntitySchema("Category", userId);

      await categoryPersistenceAdapter.save(category);

      expect(categoryRepository.save).toHaveBeenCalledTimes(1);
      expect(categoryRepository.save).toHaveBeenCalledWith(category);
    });
  });
});
