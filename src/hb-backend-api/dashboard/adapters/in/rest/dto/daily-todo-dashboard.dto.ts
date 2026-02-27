import { ApiProperty } from "@nestjs/swagger";
import { DashboardPeriod } from "../../../../domain/enums/dashboard-period.enum";
import { DailyTodoDashboardResult } from "../../../../domain/ports/in/get-daily-todo-dashboard.use-case";

class DailyTodoOverviewDto {
  @ApiProperty({ type: Number })
  total: number;

  @ApiProperty({ type: Number })
  completed: number;

  @ApiProperty({ type: Number })
  completionRate: number;

  @ApiProperty({ type: Number })
  reactionsCount: number;
}

class DailyStatDto {
  @ApiProperty({ type: String })
  date: string;

  @ApiProperty({ type: Number })
  total: number;

  @ApiProperty({ type: Number })
  completed: number;

  @ApiProperty({ type: Number })
  completionRate: number;
}

class CategoryStatDto {
  @ApiProperty({ type: String })
  categoryId: string;

  @ApiProperty({ type: String })
  categoryTitle: string;

  @ApiProperty({ type: Number })
  total: number;

  @ApiProperty({ type: Number })
  completed: number;
}

class CycleStatDto {
  @ApiProperty({ type: String })
  cycle: string;

  @ApiProperty({ type: Number })
  total: number;

  @ApiProperty({ type: Number })
  completed: number;
}

export class DailyTodoDashboardDto {
  @ApiProperty({ enum: DashboardPeriod })
  period: DashboardPeriod;

  @ApiProperty({ type: String, format: "date-time" })
  startDate: Date;

  @ApiProperty({ type: String, format: "date-time" })
  endDate: Date;

  @ApiProperty({ type: DailyTodoOverviewDto })
  overview: DailyTodoOverviewDto;

  @ApiProperty({ type: [DailyStatDto] })
  daily: DailyStatDto[];

  @ApiProperty({ type: [CategoryStatDto] })
  byCategory: CategoryStatDto[];

  @ApiProperty({ type: [CycleStatDto] })
  byCycle: CycleStatDto[];

  public static from(result: DailyTodoDashboardResult): DailyTodoDashboardDto {
    const dto = new DailyTodoDashboardDto();
    dto.period = result.period;
    dto.startDate = result.startDate;
    dto.endDate = result.endDate;
    dto.overview = result.overview;
    dto.daily = result.daily;
    dto.byCategory = result.byCategory;
    dto.byCycle = result.byCycle;
    return dto;
  }
}
