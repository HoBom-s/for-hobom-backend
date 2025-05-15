import { SchemaFactory } from "@nestjs/mongoose";
import { CategoryEntity } from "./category.entity";

export const CategorySchema = SchemaFactory.createForClass(CategoryEntity);

export type CategoryDocument = CategoryEntity & Document;
