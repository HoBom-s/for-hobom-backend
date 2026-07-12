import { ApiProperty } from "@nestjs/swagger";
import { NoteDashboardResult } from "../../../../domain/ports/in/get-note-dashboard.use-case";

class NoteOverviewDto {
  @ApiProperty({ type: Number })
  total: number;

  @ApiProperty({ type: Number })
  checklistCompletionRate: number;
}

class StatusCountDto {
  @ApiProperty({ type: String })
  status: string;

  @ApiProperty({ type: Number })
  count: number;
}

class TypeCountDto {
  @ApiProperty({ type: String })
  type: string;

  @ApiProperty({ type: Number })
  count: number;
}

class LabelCountDto {
  @ApiProperty({ type: String })
  labelId: string;

  @ApiProperty({ type: Number })
  count: number;
}

class DailyCountDto {
  @ApiProperty({ type: String })
  date: string;

  @ApiProperty({ type: Number })
  count: number;
}

export class NoteDashboardDto {
  @ApiProperty({ type: NoteOverviewDto })
  overview: NoteOverviewDto;

  @ApiProperty({ type: [StatusCountDto] })
  byStatus: StatusCountDto[];

  @ApiProperty({ type: [TypeCountDto] })
  byType: TypeCountDto[];

  @ApiProperty({ type: [LabelCountDto] })
  byLabel: LabelCountDto[];

  @ApiProperty({ type: [DailyCountDto] })
  dailyCreated: DailyCountDto[];

  public static from(result: NoteDashboardResult): NoteDashboardDto {
    const dto = new NoteDashboardDto();
    dto.overview = result.overview;
    dto.byStatus = result.byStatus;
    dto.byType = result.byType;
    dto.byLabel = result.byLabel;
    dto.dailyCreated = result.dailyCreated;
    return dto;
  }
}
