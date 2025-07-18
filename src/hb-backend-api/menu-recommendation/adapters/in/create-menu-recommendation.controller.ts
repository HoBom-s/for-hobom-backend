import { Body, Controller, Inject, Post, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { EndPointPrefixConstant } from "../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../shared/di/token.di";
import { GetUserByNicknameUseCase } from "../../../user/domain/ports/in/get-user-by-nickname.use-case";
import { CreateMenuRecommendationUseCase } from "../../domain/ports/in/create-menu-recommendation.use-case";
import { JwtAuthGuard } from "../../../../shared/adpaters/in/rest/guard/jwt-auth.guard";
import { UserNickname } from "../../../user/domain/model/user-nickname.vo";
import {
  NicknameAndAccessToken,
  TokenUserInformation,
} from "../../../../shared/adpaters/in/rest/decorator/access-token.decorator";
import { CreateMenuRecommendationDto } from "./create-menu-recommendation.dto";
import { CreateMenuRecommendationCommand } from "../../domain/ports/out/create-menu-recommendation.command";

@ApiTags("MenuRecommendation")
@Controller(`${EndPointPrefixConstant}/menu-recommendation`)
export class CreateMenuRecommendationController {
  constructor(
    @Inject(DIToken.UserModule.GetUserByNicknameUseCase)
    private readonly getUserByNicknameUseCase: GetUserByNicknameUseCase,
    @Inject(DIToken.MenuRecommendationModule.CreateMenuRecommendationUseCase)
    private readonly createMenuRecommendationUseCase: CreateMenuRecommendationUseCase,
  ) {}

  @ApiOperation({
    summary: "메뉴 항목 생성",
    description: "메뉴 항목 생성. 추후에 추첨에 들어갈 메뉴.",
  })
  @UseGuards(JwtAuthGuard)
  @Post("")
  public async create(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Body() body: CreateMenuRecommendationDto,
  ): Promise<void> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );

    const command = CreateMenuRecommendationCommand.of(
      body.name,
      body.menuKind,
      body.timeOfMeal,
      body.foodType,
      user.getId,
    );
    await this.createMenuRecommendationUseCase.invoke(command);
  }
}
