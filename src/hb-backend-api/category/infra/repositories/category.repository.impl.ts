import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CategoryRepository } from "../../domain/repositories/category.repository";
import { CategoryDocument } from "../../domain/entity/category.schema";
import {
  CategoryCreateEntitySchema,
  CategoryEntity,
} from "../../domain/entity/category.entity";
import { CategoryId } from "../../domain/vo/category-id.vo";

@Injectable()
export class CategoryRepositoryImpl implements CategoryRepository {
  constructor(
    @InjectModel(CategoryEntity.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  public async save(
    categoryEntitySchema: CategoryCreateEntitySchema,
  ): Promise<void> {
    await this.categoryModel.create({
      title: categoryEntitySchema.getTitle,
      owner: categoryEntitySchema.getOwner.raw,
    });
  }

  public async findById(id: CategoryId): Promise<CategoryDocument> {
    const foundCategory = await this.categoryModel.findById(id.raw).exec();
    if (foundCategory == null) {
      throw new NotFoundException(
        `해당 카테고리를 찾을 수 없어요. ${id.raw.toHexString()}`,
      );
    }

    return foundCategory;
  }
  public async findByTitle(title: string): Promise<CategoryDocument | null> {
    return await this.categoryModel
      .findOne({
        title: title,
      })
      .exec();
  }
}
