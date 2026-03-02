import { Prop, Schema } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { BaseEntity } from "../../../../shared/base/base.entity";
import { IssueId } from "./issue-id.vo";
import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";

@Schema({ collection: "issue-comments" })
export class IssueCommentEntity extends BaseEntity {
  @Prop({ type: Types.ObjectId, ref: "issues", required: true, index: true })
  issue: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "projects", required: true })
  project: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "user", required: true })
  author: Types.ObjectId;

  @Prop({ type: String, required: true })
  body: string;

  @Prop({ type: Date, default: null })
  editedAt: Date | null;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export class CreateIssueCommentEntity {
  constructor(
    private readonly issue: IssueId,
    private readonly project: ProjectId,
    private readonly author: UserId,
    private readonly body: string,
  ) {}

  public static of(
    issue: IssueId,
    project: ProjectId,
    author: UserId,
    body: string,
  ): CreateIssueCommentEntity {
    return new CreateIssueCommentEntity(issue, project, author, body);
  }

  public get getIssue(): IssueId {
    return this.issue;
  }

  public get getProject(): ProjectId {
    return this.project;
  }

  public get getAuthor(): UserId {
    return this.author;
  }

  public get getBody(): string {
    return this.body;
  }
}
