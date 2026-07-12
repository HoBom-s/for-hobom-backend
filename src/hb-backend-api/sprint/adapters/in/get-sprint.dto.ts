import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { SprintDocument } from "../../domain/model/sprint.schema";

export class GetSprintDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  project: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiPropertyOptional({ type: String })
  goal: string | null;

  @ApiProperty({ type: String })
  status: string;

  @ApiProperty({ type: Date })
  startDate: Date;

  @ApiProperty({ type: Date })
  endDate: Date;

  @ApiPropertyOptional({ type: Date })
  completedAt: Date | null;

  @ApiProperty({ type: String })
  createdBy: string;

  constructor(
    id: string,
    project: string,
    name: string,
    goal: string | null,
    status: string,
    startDate: Date,
    endDate: Date,
    completedAt: Date | null,
    createdBy: string,
  ) {
    this.id = id;
    this.project = project;
    this.name = name;
    this.goal = goal;
    this.status = status;
    this.startDate = startDate;
    this.endDate = endDate;
    this.completedAt = completedAt;
    this.createdBy = createdBy;
  }

  public static from(doc: SprintDocument): GetSprintDto {
    return new GetSprintDto(
      String(doc._id),
      String(doc.project),
      doc.name,
      doc.goal,
      doc.status,
      doc.startDate,
      doc.endDate,
      doc.completedAt,
      String(doc.createdBy),
    );
  }
}
