import { Body, Controller, Inject, Put, UseGuards } from "@nestjs/common";
import { EndPointPrefixConstant } from "../../../../../shared/constants/end-point-prefix.constant";
import { JwtAuthGuard } from "../../../../../shared/adpaters/in/rest/guard/jwt-auth.guard";
import { DIToken } from "../../../../../shared/di/token.di";
import { UpsertTodayMenuUseCase } from "../../../application/ports/in/upsert-today-menu.use-case";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UpsertTodayMenuDto } from "../dto/upsert-today-menu.dto";
import { UpsertTodayMenuCommand } from "../../../application/command/upsert-today-menu.command";
import { YearMonthDayString } from "../../../../daily-todo/domain/vo/year-month-day-string.vo";
import { TodayMenuId } from "../../../domain/vo/today-menu.vo";
import { MenuRecommendationId } from "../../../../menu-recommendation/domain/vo/menu-recommendation-id.vo";
import { UpsertTodayMenuResponseDto } from "../dto/upsert-today-menu-response.dto";

@ApiTags("TodayMenu")
@Controller(`${EndPointPrefixConstant}/today-menu`)
export class UpsertTodayMenuController {
  constructor(
    @Inject(DIToken.TodayMenuModule.UpsertTodayMenuUseCase)
    private readonly upsertTodayMenuUseCase: UpsertTodayMenuUseCase,
  ) {}

  @ApiOperation({
    summary: "오늘의 메뉴 추첨을 위한 메뉴 등록",
    description: "오늘의 메뉴 추첨을 위한 메뉴 등록 API",
  })
  @ApiResponse({ type: UpsertTodayMenuResponseDto })
  @UseGuards(JwtAuthGuard)
  @Put("")
  public async upsert(
    @Body() body: UpsertTodayMenuDto,
  ): Promise<UpsertTodayMenuResponseDto> {
    const command = UpsertTodayMenuCommand.of(
      body.candidates.map((item) => MenuRecommendationId.fromString(item)),
      body?.recommendedMenu == null
        ? null
        : MenuRecommendationId.fromString(body.recommendedMenu),
      body?.recommendationDate == null
        ? null
        : YearMonthDayString.fromString(body.recommendationDate),
      body?.todayMenuId == null
        ? null
        : TodayMenuId.fromSting(body.todayMenuId),
    );

    const todayMenuIdResponse =
      await this.upsertTodayMenuUseCase.invoke(command);
    return UpsertTodayMenuResponseDto.of(todayMenuIdResponse.toString());
  }
}
