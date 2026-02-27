import { ApiProperty } from "@nestjs/swagger";
import { DashboardPeriod } from "../../../../domain/enums/dashboard-period.enum";
import { ActivityDashboardResult } from "../../../../domain/ports/in/get-activity-dashboard.use-case";

class ActivityOverviewDto {
  @ApiProperty({ type: Number })
  activeDays: number;

  @ApiProperty({ type: Number })
  totalDays: number;

  @ApiProperty({ type: Number })
  activityRate: number;

  @ApiProperty({ type: Number })
  currentStreak: number;

  @ApiProperty({ type: Number })
  longestStreak: number;
}

class HeatmapEntryDto {
  @ApiProperty({ type: String })
  date: string;

  @ApiProperty({ type: Number })
  count: number;

  @ApiProperty({ type: Number })
  level: number;
}

class ModuleUsageDto {
  @ApiProperty({ type: String })
  module: string;

  @ApiProperty({ type: Number })
  count: number;

  @ApiProperty({ type: Number })
  percentage: number;
}

export class ActivityDashboardDto {
  @ApiProperty({ enum: DashboardPeriod })
  period: DashboardPeriod;

  @ApiProperty({ type: String, format: "date-time" })
  startDate: Date;

  @ApiProperty({ type: String, format: "date-time" })
  endDate: Date;

  @ApiProperty({ type: ActivityOverviewDto })
  overview: ActivityOverviewDto;

  @ApiProperty({ type: [HeatmapEntryDto] })
  heatmap: HeatmapEntryDto[];

  @ApiProperty({ type: [ModuleUsageDto] })
  moduleUsage: ModuleUsageDto[];

  public static from(result: ActivityDashboardResult): ActivityDashboardDto {
    const dto = new ActivityDashboardDto();
    dto.period = result.period;
    dto.startDate = result.startDate;
    dto.endDate = result.endDate;
    dto.overview = result.overview;
    dto.heatmap = result.heatmap;
    dto.moduleUsage = result.moduleUsage;
    return dto;
  }
}
