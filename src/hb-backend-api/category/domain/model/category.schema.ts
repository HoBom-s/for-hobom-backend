import { SchemaFactory } from "@nestjs/mongoose";
import { CategoryEntity } from "./category.entity";

export const CategorySchema = SchemaFactory.createForClass(CategoryEntity);

CategorySchema.index({ title: 1, owner: 1 }, { unique: true });

export type CategoryDocument = CategoryEntity & Document;
