import { SchemaFactory } from "@nestjs/mongoose";
import { IssueCommentEntity } from "./issue-comment.entity";

export const IssueCommentSchema =
  SchemaFactory.createForClass(IssueCommentEntity);

IssueCommentSchema.index({ issue: 1, deletedAt: 1, createdAt: 1 });
IssueCommentSchema.index({ author: 1, createdAt: -1 });

export type IssueCommentDocument = IssueCommentEntity & Document;
