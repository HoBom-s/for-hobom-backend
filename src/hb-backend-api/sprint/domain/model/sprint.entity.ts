import { Prop, Schema } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { BaseEntity } from "../../../../shared/base/base.entity";
import { SprintStatus } from "../enums/sprint-status.enum";
import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";

@Schema({ collection: "sprints" })
export class SprintEntity extends BaseEntity {
  @Prop({ type: Types.ObjectId, ref: "projects", required: true, index: true })
  project: Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, default: null })
  goal: string | null;

  @Prop({
    type: String,
    enum: SprintStatus,
    default: SprintStatus.PLANNING,
  })
  status: SprintStatus;

  @Prop({ type: Date, required: true })
  startDate: Date;

  @Prop({ type: Date, required: true })
  endDate: Date;

  @Prop({ type: Date, default: null })
  completedAt: Date | null;

  @Prop({ type: Types.ObjectId, ref: "user", required: true })
  createdBy: Types.ObjectId;
}

export class CreateSprintEntity {
  constructor(
    private readonly project: ProjectId,
    private readonly name: string,
    private readonly goal: string | null,
    private readonly startDate: Date,
    private readonly endDate: Date,
    private readonly createdBy: UserId,
  ) {}

  public static of(
    project: ProjectId,
    name: string,
    goal: string | null,
    startDate: Date,
    endDate: Date,
    createdBy: UserId,
  ): CreateSprintEntity {
    return new CreateSprintEntity(
      project,
      name,
      goal,
      startDate,
      endDate,
      createdBy,
    );
  }

  public get getProject(): ProjectId {
    return this.project;
  }

  public get getName(): string {
    return this.name;
  }

  public get getGoal(): string | null {
    return this.goal;
  }

  public get getStartDate(): Date {
    return this.startDate;
  }

  public get getEndDate(): Date {
    return this.endDate;
  }

  public get getCreatedBy(): UserId {
    return this.createdBy;
  }
}
