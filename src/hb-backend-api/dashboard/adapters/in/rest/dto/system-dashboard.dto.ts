import { ApiProperty } from "@nestjs/swagger";
import { SystemDashboardPeriod } from "../../../../domain/enums/dashboard-period.enum";
import { SystemDashboardResult } from "../../../../domain/ports/in/get-system-dashboard.use-case";

class SystemOverviewDto {
  @ApiProperty({ type: Number })
  total: number;

  @ApiProperty({ type: Number })
  sent: number;

  @ApiProperty({ type: Number })
  failed: number;

  @ApiProperty({ type: Number })
  pending: number;

  @ApiProperty({ type: Number })
  successRate: number;
}

class EventTypeCountDto {
  @ApiProperty({ type: String })
  eventType: string;

  @ApiProperty({ type: Number })
  count: number;
}

class HourlyThroughputDto {
  @ApiProperty({ type: Number })
  hour: number;

  @ApiProperty({ type: Number })
  count: number;
}

class FailureDto {
  @ApiProperty({ type: String })
  eventId: string;

  @ApiProperty({ type: String })
  eventType: string;

  @ApiProperty({ type: String, nullable: true })
  lastError: string | null;

  @ApiProperty({ type: Number })
  retryCount: number;

  @ApiProperty({ type: String, format: "date-time", nullable: true })
  failedAt: Date | null;
}

class RetryDistributionDto {
  @ApiProperty({ type: Number })
  retryCount: number;

  @ApiProperty({ type: Number })
  count: number;
}

export class SystemDashboardDto {
  @ApiProperty({ enum: SystemDashboardPeriod })
  period: SystemDashboardPeriod;

  @ApiProperty({ type: String, format: "date-time" })
  startDate: Date;

  @ApiProperty({ type: String, format: "date-time" })
  endDate: Date;

  @ApiProperty({ type: SystemOverviewDto })
  overview: SystemOverviewDto;

  @ApiProperty({ type: [EventTypeCountDto] })
  byEventType: EventTypeCountDto[];

  @ApiProperty({ type: [HourlyThroughputDto] })
  hourlyThroughput: HourlyThroughputDto[];

  @ApiProperty({ type: [FailureDto] })
  recentFailures: FailureDto[];

  @ApiProperty({ type: [RetryDistributionDto] })
  retryDistribution: RetryDistributionDto[];

  public static from(result: SystemDashboardResult): SystemDashboardDto {
    const dto = new SystemDashboardDto();
    dto.period = result.period;
    dto.startDate = result.startDate;
    dto.endDate = result.endDate;
    dto.overview = result.overview;
    dto.byEventType = result.byEventType;
    dto.hourlyThroughput = result.hourlyThroughput;
    dto.recentFailures = result.recentFailures;
    dto.retryDistribution = result.retryDistribution;
    return dto;
  }
}
