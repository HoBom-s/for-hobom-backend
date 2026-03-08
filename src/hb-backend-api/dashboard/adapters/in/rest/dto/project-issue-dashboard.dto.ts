import { ApiProperty } from "@nestjs/swagger";
import { ProjectIssueDashboardResult } from "../../../../domain/ports/in/get-project-issue-dashboard.use-case";

class IssueOverviewDto {
  @ApiProperty({ type: Number })
  total: number;

  @ApiProperty({ type: Number })
  open: number;

  @ApiProperty({ type: Number })
  done: number;

  @ApiProperty({ type: Number })
  completionRate: number;

  @ApiProperty({ type: Number })
  overdueCount: number;
}

class StatusCountDto {
  @ApiProperty({ type: String })
  statusId: string;

  @ApiProperty({ type: Number })
  count: number;
}

class PriorityCountDto {
  @ApiProperty({ type: String })
  priority: string;

  @ApiProperty({ type: Number })
  count: number;
}

class TypeCountDto {
  @ApiProperty({ type: String })
  type: string;

  @ApiProperty({ type: Number })
  count: number;
}

export class ProjectIssueDashboardDto {
  @ApiProperty({ type: IssueOverviewDto })
  overview: IssueOverviewDto;

  @ApiProperty({ type: [StatusCountDto] })
  byStatus: StatusCountDto[];

  @ApiProperty({ type: [PriorityCountDto] })
  byPriority: PriorityCountDto[];

  @ApiProperty({ type: [TypeCountDto] })
  byType: TypeCountDto[];

  public static from(
    result: ProjectIssueDashboardResult,
  ): ProjectIssueDashboardDto {
    const dto = new ProjectIssueDashboardDto();
    dto.overview = result.overview;
    dto.byStatus = result.byStatus;
    dto.byPriority = result.byPriority;
    dto.byType = result.byType;
    return dto;
  }
}
