import { Prop, Schema } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { BaseEntity } from "../../../../shared/base/base.entity";
import { MemberRole } from "../enums/member-role.enum";
import { StatusCategory } from "../enums/status-category.enum";
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
          category: { type: String, enum: StatusCategory },
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
      category: StatusCategory;
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
  ) {}

  public static of(
    key: ProjectKey,
    name: string,
    description: string | null,
    owner: UserId,
  ): CreateProjectEntity {
    return new CreateProjectEntity(key, name, description, owner);
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
}
