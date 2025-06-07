import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Body, Controller, Inject, Post, UseGuards } from "@nestjs/common";
import { EndPointPrefixConstant } from "../../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../../shared/di/token.di";
import { PickTodayMenuUseCase } from "../../../application/ports/in/pick-today-menu.use-case";
import { PickTodayMenuDto } from "../dto/pick-today-menu.dto";
import { PickTodayMenuCommand } from "../../../application/command/pick-today-menu.command";
import { TodayMenuId } from "../../../domain/vo/today-menu.vo";
import { GetPickedTodayMenuDto } from "../dto/get-picked-today-menu.dto";
import { JwtAuthGuard } from "../../../../../shared/adpaters/in/rest/guard/jwt-auth.guard";

@ApiTags("TodayMenu")
@Controller(`${EndPointPrefixConstant}/today-menu`)
export class PickTodayMenuController {
  constructor(
    @Inject(DIToken.TodayMenuModule.PickTodayMenuUseCase)
    private readonly pickTodayMenuUseCase: PickTodayMenuUseCase,
  ) {}

  @ApiOperation({
    summary: "오늘의 메뉴 추첨",
    description: "오늘의 메뉴 추첨",
  })
  @ApiResponse({ type: GetPickedTodayMenuDto })
  @UseGuards(JwtAuthGuard)
  @Post("/pick")
  public async pickMenu(
    @Body() body: PickTodayMenuDto,
  ): Promise<GetPickedTodayMenuDto> {
    const command = PickTodayMenuCommand.of(
      TodayMenuId.fromSting(body.todayMenuId),
    );
    const pickedMenuId = await this.pickTodayMenuUseCase.invoke(command);
    return GetPickedTodayMenuDto.of(pickedMenuId);
  }
}
