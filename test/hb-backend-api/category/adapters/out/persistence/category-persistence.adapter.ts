import { NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";
import { createCategoryRepository } from "../../../../../mocks/category.repository.mock";
import { CategoryRepository } from "../../../../../../src/hb-backend-api/category/domain/repositories/category.repository";
import { CategoryPersistenceAdapter } from "../../../../../../src/hb-backend-api/category/adapters/out/persistence/category-persistence.adapter";
import {
  CategoryCreateEntitySchema,
  CategoryUpdateEntitySchema,
} from "../../../../../../src/hb-backend-api/category/domain/entity/category.entity";
import { UserId } from "../../../../../../src/hb-backend-api/user/domain/vo/user-id.vo";
import { CategoryTitle } from "../../../../../../src/hb-backend-api/category/domain/vo/category-title.vo";
import { CategoryId } from "../../../../../../src/hb-backend-api/category/domain/vo/category-id.vo";

describe("CategoryPersistenceAdapter", () => {
  let categoryRepository: jest.Mocked<CategoryRepository>;
  let categoryPersistenceAdapter: CategoryPersistenceAdapter;

  beforeEach(() => {
    categoryRepository = createCategoryRepository();
    categoryPersistenceAdapter = new CategoryPersistenceAdapter(
      categoryRepository,
    );
  });

  describe("save()", () => {
    it("should call categoryRepository.save with the given category", async () => {
      const userId = new UserId(new Types.ObjectId());
      const category = new CategoryCreateEntitySchema(
        CategoryTitle.fromString("Category"),
        userId,
      );

      await categoryPersistenceAdapter.save(category);

      expect(categoryRepository.save).toHaveBeenCalledTimes(1);
      expect(categoryRepository.save).toHaveBeenCalledWith(category);
    });
  });

  describe("updateOne()", () => {
    it("should call categoryRepository.updateTitle with the given category", async () => {
      const userId = new UserId(new Types.ObjectId());
      const categoryId = new CategoryId(new Types.ObjectId());
      const category = new CategoryUpdateEntitySchema(
        CategoryTitle.fromString("Category"),
        userId,
      );

      await categoryPersistenceAdapter.updateOne(categoryId, category);

      expect(categoryRepository.updateTitle).toHaveBeenCalledTimes(1);
      expect(categoryRepository.updateTitle).toHaveBeenCalledWith(category);
    });

    it("should throw NotFoundException when the given category does not exist", async () => {
      const userId = new UserId(new Types.ObjectId());
      const categoryId = new CategoryId(new Types.ObjectId());
      const category = new CategoryUpdateEntitySchema(
        CategoryTitle.fromString("Category"),
        userId,
      );

      categoryRepository.updateTitle.mockResolvedValue(null as any);

      await expect(
        categoryPersistenceAdapter.updateOne(categoryId, category),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("deleteOne()", () => {
    it("should call categoryRepository.deleteOne with the given category", async () => {
      const categoryId = new CategoryId(new Types.ObjectId());
      const userId = new UserId(new Types.ObjectId());

      await categoryPersistenceAdapter.deleteOne(categoryId, userId);

      expect(categoryRepository.deleteOne).toHaveBeenCalledTimes(1);
      expect(categoryRepository.deleteOne).toHaveBeenCalledWith(
        categoryId,
        userId,
      );
    });

    it("should throw NotFoundException when the given category id does not exist", async () => {
      const userId = new UserId(new Types.ObjectId());
      const categoryId = new CategoryId(new Types.ObjectId());

      categoryRepository.findById.mockResolvedValue(null as any);

      await expect(
        categoryPersistenceAdapter.deleteOne(categoryId, userId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
