import { SchemaFactory } from "@nestjs/mongoose";
import { ProjectEntity } from "./project.entity";

export const ProjectSchema = SchemaFactory.createForClass(ProjectEntity);

ProjectSchema.index({ key: 1 }, { unique: true });
ProjectSchema.index({ owner: 1 });
ProjectSchema.index({ "members.userId": 1 });

export type ProjectDocument = ProjectEntity & Document;
