import { Prop, Schema } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { BaseEntity } from "../../../../shared/base/base.entity";
import { BoardType } from "../enums/board-type.enum";
import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";

@Schema({ collection: "boards" })
export class BoardEntity extends BaseEntity {
  @Prop({ type: Types.ObjectId, ref: "projects", required: true, index: true })
  project: Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, enum: BoardType, required: true })
  type: BoardType;

  @Prop({
    type: [
      {
        statusId: { type: String },
        name: { type: String },
        wipLimit: { type: Number, default: null },
        order: { type: Number },
      },
    ],
    default: [],
  })
  columns: {
    statusId: string;
    name: string;
    wipLimit: number | null;
    order: number;
  }[];

  @Prop({
    type: {
      issueTypes: { type: [String], default: [] },
      assignees: { type: [Types.ObjectId], default: [] },
      labels: { type: [String], default: [] },
    },
    default: null,
  })
  filters: {
    issueTypes: string[];
    assignees: Types.ObjectId[];
    labels: string[];
  } | null;

  @Prop({ type: Types.ObjectId, ref: "user", required: true })
  createdBy: Types.ObjectId;
}

export class CreateBoardEntity {
  constructor(
    private readonly project: ProjectId,
    private readonly name: string,
    private readonly type: BoardType,
    private readonly createdBy: UserId,
  ) {}

  public static of(
    project: ProjectId,
    name: string,
    type: BoardType,
    createdBy: UserId,
  ): CreateBoardEntity {
    return new CreateBoardEntity(project, name, type, createdBy);
  }

  public get getProject(): ProjectId {
    return this.project;
  }

  public get getName(): string {
    return this.name;
  }

  public get getType(): BoardType {
    return this.type;
  }

  public get getCreatedBy(): UserId {
    return this.createdBy;
  }
}
