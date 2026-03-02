import { SchemaFactory } from "@nestjs/mongoose";
import { IssueHistoryEntity } from "./issue-history.entity";

export const IssueHistorySchema =
  SchemaFactory.createForClass(IssueHistoryEntity);

IssueHistorySchema.index({ issue: 1, createdAt: -1 });
IssueHistorySchema.index({ project: 1, actor: 1, createdAt: -1 });
IssueHistorySchema.index({ project: 1, action: 1, createdAt: -1 });

export type IssueHistoryDocument = IssueHistoryEntity & Document;
