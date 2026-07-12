import { Prop, Schema } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { BaseEntity } from "../../../../shared/base/base.entity";
import { MemberRole } from "../enums/member-role.enum";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { ProjectKey } from "./project-key.vo";

@Schema({ collection: "projects" })
export class ProjectEntity extends BaseEntity {
  @Prop({ type: String, required: true, unique: true })
  key: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, default: null })
  description: string | null;

  @Prop({ type: Types.ObjectId, ref: "user", required: true, index: true })
  owner: Types.ObjectId;

  @Prop({
    type: [
      {
        userId: { type: Types.ObjectId, ref: "user" },
        role: { type: String, enum: MemberRole },
        joinedAt: { type: Date },
      },
    ],
    default: [],
  })
  members: {
    userId: Types.ObjectId;
    role: MemberRole;
    joinedAt: Date;
  }[];

  @Prop({ type: Number, default: 0 })
  issueSequence: number;

  @Prop({
    type: {
      statuses: [
        {
          id: { type: String },
          name: { type: String },
          isDone: { type: Boolean, default: false },
          order: { type: Number },
        },
      ],
      transitions: [
        {
          from: { type: String },
          to: { type: String },
          name: { type: String },
        },
      ],
    },
    default: null,
  })
  workflow: {
    statuses: {
      id: string;
      name: string;
      isDone: boolean;
      order: number;
    }[];
    transitions: {
      from: string;
      to: string;
      name: string;
    }[];
  } | null;

  @Prop({
    type: [
      {
        id: { type: String },
        name: { type: String },
        icon: { type: String },
        isSubtask: { type: Boolean },
      },
    ],
    default: [],
  })
  issueTypes: {
    id: string;
    name: string;
    icon: string;
    isSubtask: boolean;
  }[];

  @Prop({
    type: [
      {
        id: { type: String },
        name: { type: String },
        icon: { type: String },
        order: { type: Number },
      },
    ],
    default: [],
  })
  priorities: {
    id: string;
    name: string;
    icon: string;
    order: number;
  }[];
}

export class CreateProjectEntity {
  constructor(
    private readonly key: ProjectKey,
    private readonly name: string,
    private readonly description: string | null,
    private readonly owner: UserId,
    private readonly workflow: Record<string, unknown> | null,
    private readonly issueTypes: readonly Record<string, unknown>[],
    private readonly priorities: readonly Record<string, unknown>[],
  ) {}

  public static of(
    key: ProjectKey,
    name: string,
    description: string | null,
    owner: UserId,
    workflow: Record<string, unknown> | null = null,
    issueTypes: readonly Record<string, unknown>[] = [],
    priorities: readonly Record<string, unknown>[] = [],
  ): CreateProjectEntity {
    return new CreateProjectEntity(
      key,
      name,
      description,
      owner,
      workflow,
      issueTypes,
      priorities,
    );
  }

  public get getKey(): ProjectKey {
    return this.key;
  }

  public get getName(): string {
    return this.name;
  }

  public get getDescription(): string | null {
    return this.description;
  }

  public get getOwner(): UserId {
    return this.owner;
  }

  public get getWorkflow(): Record<string, unknown> | null {
    return this.workflow;
  }

  public get getIssueTypes(): readonly Record<string, unknown>[] {
    return this.issueTypes;
  }

  public get getPriorities(): readonly Record<string, unknown>[] {
    return this.priorities;
  }
}
