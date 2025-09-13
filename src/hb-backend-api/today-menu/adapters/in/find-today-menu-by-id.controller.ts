import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Controller, Get, Inject, Param, UseGuards } from "@nestjs/common";
import { EndPointPrefixConstant } from "../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../shared/di/token.di";
import { FindTodayMenuByIdUseCase } from "../../domain/ports/in/find-today-menu-by-id.use-case";
import { GetTodayMenuDto } from "./get-today-menu.dto";
import { TodayMenuId } from "../../domain/model/today-menu.vo";
import { ParseTodayMenuIdPipe } from "./today-menu-id.pipe";
import { JwtAuthGuard } from "../../../../shared/adpaters/in/rest/guard/jwt-auth.guard";

@ApiTags("TodayMenu")
@Controller(`${EndPointPrefixConstant}/today-menu`)
export class FindTodayMenuByIdController {
  constructor(
    @Inject(DIToken.TodayMenuModule.FindTodayMenuByIdUseCase)
    private readonly findTodayMenuByIdUseCase: FindTodayMenuByIdUseCase,
  ) {}

  @ApiOperation({
    summary: "메뉴 아이디로 단건 조회",
    description: "메뉴 아이디로 단건 조회",
  })
  @ApiResponse({ type: GetTodayMenuDto })
  @Get("/:id")
  @UseGuards(JwtAuthGuard)
  public async findById(
    @Param("id", ParseTodayMenuIdPipe) id: TodayMenuId,
  ): Promise<GetTodayMenuDto> {
    const todayMenu = await this.findTodayMenuByIdUseCase.invoke(id);

    return GetTodayMenuDto.from(todayMenu);
  }
}
