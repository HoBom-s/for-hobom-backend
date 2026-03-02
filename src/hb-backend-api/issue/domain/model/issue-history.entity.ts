import { Prop, Schema } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { BaseEntity } from "../../../../shared/base/base.entity";
import { IssueHistoryAction } from "../enums/issue-history-action.enum";
import { IssueId } from "./issue-id.vo";
import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";

@Schema({ collection: "issue-histories", timestamps: { updatedAt: false } })
export class IssueHistoryEntity extends BaseEntity {
  @Prop({ type: Types.ObjectId, ref: "issues", required: true, index: true })
  issue: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "projects", required: true })
  project: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "user", required: true })
  actor: Types.ObjectId;

  @Prop({ type: String, enum: IssueHistoryAction, required: true })
  action: IssueHistoryAction;

  @Prop({
    type: [
      {
        field: { type: String },
        from: { type: String, default: null },
        to: { type: String, default: null },
      },
    ],
    default: [],
  })
  changes: {
    field: string;
    from: string | null;
    to: string | null;
  }[];
}

export class CreateIssueHistoryEntity {
  constructor(
    private readonly issue: IssueId,
    private readonly project: ProjectId,
    private readonly actor: UserId,
    private readonly action: IssueHistoryAction,
    private readonly changes: {
      field: string;
      from: string | null;
      to: string | null;
    }[],
  ) {}

  public static of(
    issue: IssueId,
    project: ProjectId,
    actor: UserId,
    action: IssueHistoryAction,
    changes: { field: string; from: string | null; to: string | null }[],
  ): CreateIssueHistoryEntity {
    return new CreateIssueHistoryEntity(issue, project, actor, action, changes);
  }

  public get getIssue(): IssueId {
    return this.issue;
  }

  public get getProject(): ProjectId {
    return this.project;
  }

  public get getActor(): UserId {
    return this.actor;
  }

  public get getAction(): IssueHistoryAction {
    return this.action;
  }

  public get getChanges(): {
    field: string;
    from: string | null;
    to: string | null;
  }[] {
    return this.changes;
  }
}
