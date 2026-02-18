import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Body, Controller, Inject, Post, UseGuards } from "@nestjs/common";
import { EndPointPrefixConstant } from "../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../shared/di/token.di";
import { PickTodayMenuUseCase } from "../../domain/ports/in/pick-today-menu.use-case";
import { PickTodayMenuDto } from "./pick-today-menu.dto";
import { PickTodayMenuCommand } from "../../domain/ports/out/pick-today-menu.command";
import { TodayMenuId } from "../../domain/model/today-menu.vo";
import { GetPickedTodayMenuDto } from "./get-picked-today-menu.dto";
import { JwtAuthGuard } from "../../../../shared/adapters/in/rest/guard/jwt-auth.guard";

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
