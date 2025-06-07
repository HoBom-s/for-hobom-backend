import { Controller, Get, Inject, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { EndPointPrefixConstant } from "../../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../../shared/di/token.di";
import { FindAllMenuRecommendationUseCase } from "../../../application/ports/in/find-all-menu-recommendation.use-case";
import { JwtAuthGuard } from "../../../../../shared/adpaters/in/rest/guard/jwt-auth.guard";
import { GetMenuRecommendationDto } from "../dto/get-menu-recommendation.dto";

@ApiTags("MenuRecommendation")
@Controller(`${EndPointPrefixConstant}/menu-recommendation`)
export class FindAllMenuRecommendationController {
  constructor(
    @Inject(DIToken.MenuRecommendationModule.FindAllMenuRecommendationUseCase)
    private readonly findAllMenuRecommendationUseCase: FindAllMenuRecommendationUseCase,
  ) {}

  @ApiOperation({
    summary: "모든 메뉴 항목 조회",
    description: "모든 메뉴 항목 조회",
  })
  @ApiResponse({ type: [GetMenuRecommendationDto] })
  @UseGuards(JwtAuthGuard)
  @Get("")
  public async findAll(): Promise<GetMenuRecommendationDto[]> {
    const menuRecommendations =
      await this.findAllMenuRecommendationUseCase.invoke();

    return menuRecommendations.map(GetMenuRecommendationDto.from);
  }
}
