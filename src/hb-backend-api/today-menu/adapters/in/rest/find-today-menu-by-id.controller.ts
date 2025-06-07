import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Controller, Get, Inject, Param } from "@nestjs/common";
import { EndPointPrefixConstant } from "../../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../../shared/di/token.di";
import { FindTodayMenuByIdUseCase } from "../../../application/ports/in/find-today-menu-by-id.use-case";
import { GetTodayMenuDto } from "../dto/get-today-menu.dto";
import { TodayMenuId } from "../../../domain/vo/today-menu.vo";
import { ParseTodayMenuIdPipe } from "../pipe/today-menu-id.pipe";

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
  public async findById(
    @Param("id", ParseTodayMenuIdPipe) id: TodayMenuId,
  ): Promise<GetTodayMenuDto> {
    const todayMenu = await this.findTodayMenuByIdUseCase.invoke(id);

    return GetTodayMenuDto.from(todayMenu);
  }
}
