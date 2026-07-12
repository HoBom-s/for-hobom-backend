import { ApiProperty } from "@nestjs/swagger";
import { FutureMessageDashboardResult } from "../../../../domain/ports/in/get-future-message-dashboard.use-case";

class FutureMessageOverviewDto {
  @ApiProperty({ type: Number })
  total: number;

  @ApiProperty({ type: Number })
  pending: number;

  @ApiProperty({ type: Number })
  sent: number;
}

class UpcomingMessageDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  title: string;

  @ApiProperty({ type: String })
  recipientId: string;

  @ApiProperty({ type: String })
  scheduledAt: string;
}

class MonthlyTrendDto {
  @ApiProperty({ type: String })
  month: string;

  @ApiProperty({ type: Number })
  count: number;
}

export class FutureMessageDashboardDto {
  @ApiProperty({ type: FutureMessageOverviewDto })
  overview: FutureMessageOverviewDto;

  @ApiProperty({ type: [UpcomingMessageDto] })
  upcoming: UpcomingMessageDto[];

  @ApiProperty({ type: [MonthlyTrendDto] })
  monthlyTrend: MonthlyTrendDto[];

  public static from(
    result: FutureMessageDashboardResult,
  ): FutureMessageDashboardDto {
    const dto = new FutureMessageDashboardDto();
    dto.overview = result.overview;
    dto.upcoming = result.upcoming;
    dto.monthlyTrend = result.monthlyTrend;
    return dto;
  }
}
