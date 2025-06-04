import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Body, Controller, Inject, Post, UseGuards } from "@nestjs/common";
import { EndPointPrefixConstant } from "../../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../../shared/di/token.di";
import { GetUserByNicknameUseCase } from "../../../../user/application/ports/in/get-user-by-nickname.use-case";
import { CreateCategoryUseCase } from "../../../application/ports/in/create-category.use-case";
import { JwtAuthGuard } from "../../../../../shared/adpaters/in/rest/guard/jwt-auth.guard";
import {
  NicknameAndAccessToken,
  TokenUserInformation,
} from "../../../../../shared/adpaters/in/rest/decorator/access-token.decorator";
import { CreateCategoryDto } from "../dto/create-category.dto";
import { UserNickname } from "../../../../user/domain/vo/user-nickname.vo";
import { CreateCategoryCommand } from "../../../application/command/create-category.command";
import { CategoryTitle } from "../../../domain/vo/category-title.vo";

@ApiTags("Categories")
@Controller(`${EndPointPrefixConstant}/categories`)
export class CreateCategoryController {
  constructor(
    @Inject(DIToken.UserModule.GetUserByNicknameUseCase)
    private readonly getUserByNicknameUseCase: GetUserByNicknameUseCase,
    @Inject(DIToken.CategoryModule.CreateCategoryUseCase)
    private readonly createCategoryUseCase: CreateCategoryUseCase,
  ) {}

  @ApiOperation({
    summary: "카테고리 생성",
    description: "카테고리 생성",
  })
  @UseGuards(JwtAuthGuard)
  @Post("")
  public async createCategory(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Body() body: CreateCategoryDto,
  ): Promise<void> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );

    await this.createCategoryUseCase.invoke(
      CreateCategoryCommand.of(
        CategoryTitle.fromString(body.title),
        user.getId,
      ),
    );
  }
}
