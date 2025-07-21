import { ApiProperty } from "@nestjs/swagger";

export class UpsertTodayMenuResponseDto {
  @ApiProperty({ type: String })
  todayMenuId: string;

  constructor(todayMenuId: string) {
    this.todayMenuId = todayMenuId;
  }

  public static of(todayMenuId: string): UpsertTodayMenuResponseDto {
    return new UpsertTodayMenuResponseDto(todayMenuId);
  }
}
