import { Prop, Schema } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { BaseEntity } from "../../../../shared/base/base.entity";
import { IssueType } from "../enums/issue-type.enum";
import { IssuePriority } from "../enums/issue-priority.enum";
import { IssueResolution } from "../enums/issue-resolution.enum";
import { StatusCategory } from "../../../project/domain/enums/status-category.enum";
import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";

@Schema({ collection: "issues" })
export class IssueEntity extends BaseEntity {
  @Prop({ type: Types.ObjectId, ref: "projects", required: true, index: true })
  project: Types.ObjectId;

  @Prop({ type: Number, required: true })
  issueNumber: number;

  @Prop({ type: String, required: true })
  issueKey: string;

  @Prop({ type: String, enum: IssueType, required: true })
  type: IssueType;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, default: null })
  description: string | null;

  @Prop({ type: String, required: true })
  status: string;

  @Prop({ type: String, enum: StatusCategory, required: true })
  statusCategory: StatusCategory;

  @Prop({ type: String, enum: IssuePriority, default: IssuePriority.MEDIUM })
  priority: IssuePriority;

  @Prop({
    type: String,
    enum: IssueResolution,
    default: null,
  })
  resolution: IssueResolution | null;

  @Prop({ type: Types.ObjectId, ref: "user", required: true, index: true })
  reporter: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "user", default: null, index: true })
  assignee: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: "sprints", default: null })
  sprint: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: "issues", default: null })
  parent: Types.ObjectId | null;

  @Prop({ type: [String], default: [] })
  labels: string[];

  @Prop({ type: [Types.ObjectId], ref: "user", default: [] })
  watchers: Types.ObjectId[];

  @Prop({ type: Number, default: null })
  storyPoints: number | null;

  @Prop({ type: Number, default: 0 })
  boardOrder: number;

  @Prop({ type: Number, default: 0 })
  backlogOrder: number;

  @Prop({ type: Date, default: null })
  dueDate: Date | null;

  @Prop({ type: Date, default: null })
  startDate: Date | null;

  @Prop({ type: Date, default: null })
  resolvedAt: Date | null;

  @Prop({ type: Date, default: null })
  archivedAt: Date | null;
}

export class CreateIssueEntity {
  constructor(
    private readonly project: ProjectId,
    private readonly issueNumber: number,
    private readonly issueKey: string,
    private readonly type: IssueType,
    private readonly title: string,
    private readonly description: string | null,
    private readonly status: string,
    private readonly statusCategory: StatusCategory,
    private readonly priority: IssuePriority,
    private readonly reporter: UserId,
    private readonly assignee: UserId | null,
    private readonly sprint: Types.ObjectId | null,
    private readonly parent: Types.ObjectId | null,
    private readonly labels: string[],
  ) {}

  public static of(
    project: ProjectId,
    issueNumber: number,
    issueKey: string,
    type: IssueType,
    title: string,
    description: string | null,
    status: string,
    statusCategory: StatusCategory,
    priority: IssuePriority,
    reporter: UserId,
    assignee: UserId | null,
    sprint: Types.ObjectId | null,
    parent: Types.ObjectId | null,
    labels: string[],
  ): CreateIssueEntity {
    return new CreateIssueEntity(
      project,
      issueNumber,
      issueKey,
      type,
      title,
      description,
      status,
      statusCategory,
      priority,
      reporter,
      assignee,
      sprint,
      parent,
      labels,
    );
  }

  public get getProject(): ProjectId {
    return this.project;
  }

  public get getIssueNumber(): number {
    return this.issueNumber;
  }

  public get getIssueKey(): string {
    return this.issueKey;
  }

  public get getType(): IssueType {
    return this.type;
  }

  public get getTitle(): string {
    return this.title;
  }

  public get getDescription(): string | null {
    return this.description;
  }

  public get getStatus(): string {
    return this.status;
  }

  public get getStatusCategory(): StatusCategory {
    return this.statusCategory;
  }

  public get getPriority(): IssuePriority {
    return this.priority;
  }

  public get getReporter(): UserId {
    return this.reporter;
  }

  public get getAssignee(): UserId | null {
    return this.assignee;
  }

  public get getSprint(): Types.ObjectId | null {
    return this.sprint;
  }

  public get getParent(): Types.ObjectId | null {
    return this.parent;
  }

  public get getLabels(): string[] {
    return this.labels;
  }
}
