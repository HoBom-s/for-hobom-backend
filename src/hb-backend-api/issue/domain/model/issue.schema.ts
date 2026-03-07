import { SchemaFactory } from "@nestjs/mongoose";
import { IssueEntity } from "./issue.entity";

export const IssueSchema = SchemaFactory.createForClass(IssueEntity);

IssueSchema.index({ project: 1, issueNumber: 1 }, { unique: true });
IssueSchema.index({ project: 1, sprint: 1, status: 1, boardOrder: 1 });
IssueSchema.index({ project: 1, sprint: 1, backlogOrder: 1 });
IssueSchema.index({ assignee: 1, status: 1, updatedAt: -1 });
IssueSchema.index({ parent: 1, type: 1 });
IssueSchema.index({ project: 1, issueKey: 1 });
IssueSchema.index({ project: 1, dueDate: 1, status: 1 });
IssueSchema.index({ title: "text", description: "text" });

export type IssueDocument = IssueEntity & Document;
