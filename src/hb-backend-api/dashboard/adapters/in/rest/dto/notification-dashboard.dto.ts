import { ApiProperty } from "@nestjs/swagger";
import { DashboardPeriod } from "../../../../domain/enums/dashboard-period.enum";
import { NotificationDashboardResult } from "../../../../domain/ports/in/get-notification-dashboard.use-case";

class NotificationOverviewDto {
  @ApiProperty({ type: Number })
  total: number;

  @ApiProperty({ type: Number })
  read: number;

  @ApiProperty({ type: Number })
  unread: number;
}

class DailyTrendDto {
  @ApiProperty({ type: String })
  date: string;

  @ApiProperty({ type: Number })
  count: number;
}

class CategoryCountDto {
  @ApiProperty({ type: String })
  category: string;

  @ApiProperty({ type: Number })
  count: number;
}

class UnreadNotificationDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  title: string;

  @ApiProperty({ type: String })
  category: string;

  @ApiProperty({ type: String, format: "date-time" })
  createdAt: Date;
}

export class NotificationDashboardDto {
  @ApiProperty({ enum: DashboardPeriod })
  period: DashboardPeriod;

  @ApiProperty({ type: String, format: "date-time" })
  startDate: Date;

  @ApiProperty({ type: String, format: "date-time" })
  endDate: Date;

  @ApiProperty({ type: NotificationOverviewDto })
  overview: NotificationOverviewDto;

  @ApiProperty({ type: [DailyTrendDto] })
  dailyTrend: DailyTrendDto[];

  @ApiProperty({ type: [CategoryCountDto] })
  byCategory: CategoryCountDto[];

  @ApiProperty({ type: [UnreadNotificationDto] })
  recentUnread: UnreadNotificationDto[];

  public static from(
    result: NotificationDashboardResult,
  ): NotificationDashboardDto {
    const dto = new NotificationDashboardDto();
    dto.period = result.period;
    dto.startDate = result.startDate;
    dto.endDate = result.endDate;
    dto.overview = result.overview;
    dto.dailyTrend = result.dailyTrend;
    dto.byCategory = result.byCategory;
    dto.recentUnread = result.recentUnread;
    return dto;
  }
}
