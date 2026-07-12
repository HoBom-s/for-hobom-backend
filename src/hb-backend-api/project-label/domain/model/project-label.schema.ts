import { SchemaFactory } from "@nestjs/mongoose";
import { ProjectLabelEntity } from "./project-label.entity";

export const ProjectLabelSchema =
  SchemaFactory.createForClass(ProjectLabelEntity);

ProjectLabelSchema.index({ project: 1, name: 1 }, { unique: true });

export type ProjectLabelDocument = ProjectLabelEntity & Document;
