import { ApiProperty } from "@nestjs/swagger";
import { SprintDashboardResult } from "../../../../domain/ports/in/get-sprint-dashboard.use-case";

class SprintInfoDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String, nullable: true })
  goal: string | null;

  @ApiProperty({ type: String })
  status: string;

  @ApiProperty({ type: String, format: "date-time" })
  startDate: Date;

  @ApiProperty({ type: String, format: "date-time" })
  endDate: Date;
}

class SprintOverviewDto {
  @ApiProperty({ type: Number })
  totalIssues: number;

  @ApiProperty({ type: Number })
  completedIssues: number;

  @ApiProperty({ type: Number })
  completionRate: number;

  @ApiProperty({ type: Number })
  totalStoryPoints: number;

  @ApiProperty({ type: Number })
  completedStoryPoints: number;
}

export class SprintDashboardDto {
  @ApiProperty({ type: SprintInfoDto })
  sprint: SprintInfoDto;

  @ApiProperty({ type: SprintOverviewDto })
  overview: SprintOverviewDto;

  public static from(result: SprintDashboardResult): SprintDashboardDto {
    const dto = new SprintDashboardDto();
    dto.sprint = result.sprint;
    dto.overview = result.overview;
    return dto;
  }
}
