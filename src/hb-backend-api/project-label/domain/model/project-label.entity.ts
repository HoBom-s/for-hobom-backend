import { Prop, Schema } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { BaseEntity } from "../../../../shared/base/base.entity";
import { ProjectId } from "../../../project/domain/model/project-id.vo";

@Schema({ collection: "project-labels" })
export class ProjectLabelEntity extends BaseEntity {
  @Prop({ type: Types.ObjectId, ref: "projects", required: true, index: true })
  project: Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, default: "#6B7280" })
  color: string;
}

export class CreateProjectLabelEntity {
  constructor(
    private readonly project: ProjectId,
    private readonly name: string,
    private readonly color: string,
  ) {}

  public static of(
    project: ProjectId,
    name: string,
    color: string,
  ): CreateProjectLabelEntity {
    return new CreateProjectLabelEntity(project, name, color);
  }

  public get getProject(): ProjectId {
    return this.project;
  }

  public get getName(): string {
    return this.name;
  }

  public get getColor(): string {
    return this.color;
  }
}
