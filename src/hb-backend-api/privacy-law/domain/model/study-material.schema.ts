import { SchemaFactory } from "@nestjs/mongoose";
import { StudyMaterialEntity } from "./study-material.entity";

export const StudyMaterialSchema =
  SchemaFactory.createForClass(StudyMaterialEntity);

StudyMaterialSchema.index({ diffId: 1 }, { unique: true });

export type StudyMaterialDocument = StudyMaterialEntity & Document;
