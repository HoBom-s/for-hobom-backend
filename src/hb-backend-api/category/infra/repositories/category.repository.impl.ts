import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CategoryRepository } from "../../domain/model/category.repository";
import { CategoryDocument } from "../../domain/model/category.schema";
import {
  CategoryCreateEntitySchema,
  CategoryEntity,
  CategoryUpdateEntitySchema,
} from "../../domain/model/category.entity";
import { CategoryId } from "../../domain/model/category-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { CategoryTitle } from "../../domain/model/category-title.vo";
import { MongoSessionContext } from "../../../../infra/mongo/transaction/transaction.context";

@Injectable()
export class CategoryRepositoryImpl implements CategoryRepository {
  constructor(
    @InjectModel(CategoryEntity.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  public async save(
    categoryEntitySchema: CategoryCreateEntitySchema,
  ): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.categoryModel.create(
      [
        {
          title: categoryEntitySchema.getTitle.raw,
          owner: categoryEntitySchema.getOwner.raw,
        },
      ],
      {
        session: session,
      },
    );
  }

  public async findAll(userId: UserId): Promise<CategoryDocument[]> {
    const categories = await this.categoryModel
      .find({
        owner: userId.raw,
      })
      .exec();
    if (categories == null) {
      return [];
    }

    return categories;
  }

  public async findById(
    id: CategoryId,
    owner: UserId,
  ): Promise<CategoryDocument> {
    const foundCategory = await this.categoryModel
      .findOne({
        _id: id.raw,
        owner: owner.raw,
      })
      .exec();
    if (foundCategory == null) {
      throw new NotFoundException(
        `해당 카테고리를 찾을 수 없어요. 카테고리 ID: ${id.raw.toHexString()}, 유저 ID: ${owner.toString()}`,
      );
    }

    return foundCategory;
  }
  public async findByTitle(
    title: CategoryTitle,
    owner: UserId,
  ): Promise<CategoryDocument | null> {
    return await this.categoryModel
      .findOne({
        title: title.raw,
        owner: owner.raw,
      })
      .exec();
  }

  public async updateTitle(
    categoryId: CategoryId,
    categoryUpdateEntitySchema: CategoryUpdateEntitySchema,
  ): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.categoryModel.findOneAndUpdate(
      {
        _id: categoryId.raw,
        owner: categoryUpdateEntitySchema.getOwner.raw,
      },
      {
        $set: {
          title: categoryUpdateEntitySchema.getTitle.raw,
        },
      },
      { session: session },
    );
  }

  public async deleteOne(categoryId: CategoryId, owner: UserId): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.categoryModel.deleteOne(
      { _id: categoryId.raw, owner: owner.raw },
      { session: session },
    );
  }
}
