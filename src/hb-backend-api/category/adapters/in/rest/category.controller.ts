import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Body, Controller, Get, Inject, Post } from "@nestjs/common";
import { EndPointPrefixConstant } from "../../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../../shared/di/token.di";
import { CreateCategoryUseCase } from "../../../application/ports/in/create-category.use-case";
import { CreateCategoryDto } from "../dto/create-category.dto";
import { GetUserByNicknameUseCase } from "../../../../user/application/ports/in/get-user-by-nickname.use-case";
import {
  NicknameAndAccessToken,
  TokenUserInformation,
} from "../../../../../shared/adpaters/in/rest/decorator/access-token.decorator";
import { UserNickname } from "../../../../user/domain/vo/user-nickname.vo";
import { CreateCategoryCommand } from "../../../application/command/create-category.command";
import { GetAllCategoryUseCase } from "../../../application/ports/in/get-all-category.use-case";
import { GetCategoryDto } from "../dto/get-category.dto";
import { CategoryTitle } from "../../../domain/vo/category-title.vo";

@ApiTags("Categories")
@Controller(`${EndPointPrefixConstant}/categories`)
export class CategoryController {
  constructor(
    @Inject(DIToken.UserModule.GetUserByNicknameUseCase)
    private readonly getUserByNicknameUseCase: GetUserByNicknameUseCase,
    @Inject(DIToken.CategoryModule.CreateCategoryUseCase)
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    @Inject(DIToken.CategoryModule.GetAllCategoryUseCase)
    private readonly getAllCategoryUseCase: GetAllCategoryUseCase,
  ) {}

  @ApiOperation({ description: "모든 카테고리 조회" })
  @Get("")
  public async getAll(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
  ): Promise<GetCategoryDto[]> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );

    const categories = await this.getAllCategoryUseCase.invoke(user.getId);
    return categories.map(GetCategoryDto.from);
  }

  @ApiOperation({ description: "카테고리 생성" })
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
