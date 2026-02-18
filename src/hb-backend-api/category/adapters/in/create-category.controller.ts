import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Body, Controller, Inject, Post, UseGuards } from "@nestjs/common";
import { EndPointPrefixConstant } from "../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../shared/di/token.di";
import { GetUserByNicknameUseCase } from "../../../user/domain/ports/in/get-user-by-nickname.use-case";
import { CreateCategoryUseCase } from "../../domain/ports/in/create-category.use-case";
import { JwtAuthGuard } from "../../../../shared/adapters/in/rest/guard/jwt-auth.guard";
import {
  NicknameAndAccessToken,
  TokenUserInformation,
} from "../../../../shared/adapters/in/rest/decorator/access-token.decorator";
import { CreateCategoryDto } from "./create-category.dto";
import { UserNickname } from "../../../user/domain/model/user-nickname.vo";
import { CreateCategoryCommand } from "../../domain/ports/out/create-category.command";
import { CategoryTitle } from "../../domain/model/category-title.vo";

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
