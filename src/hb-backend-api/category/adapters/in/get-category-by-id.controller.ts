import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Controller, Get, Inject, Param, UseGuards } from "@nestjs/common";
import { EndPointPrefixConstant } from "../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../shared/di/token.di";
import { GetUserByNicknameUseCase } from "../../../user/domain/ports/in/get-user-by-nickname.use-case";
import { GetCategoryDto } from "./get-category.dto";
import { JwtAuthGuard } from "../../../../shared/adapters/in/rest/guard/jwt-auth.guard";
import {
  NicknameAndAccessToken,
  TokenUserInformation,
} from "../../../../shared/adapters/in/rest/decorator/access-token.decorator";
import { ParseCategoryIdPipe } from "./category-id.pipe";
import { CategoryId } from "../../domain/model/category-id.vo";
import { UserNickname } from "../../../user/domain/model/user-nickname.vo";
import { GetCategoryUseCase } from "../../domain/ports/in/get-category.use-case";

@ApiTags("Categories")
@Controller(`${EndPointPrefixConstant}/categories`)
export class GetCategoryByIdController {
  constructor(
    @Inject(DIToken.UserModule.GetUserByNicknameUseCase)
    private readonly getUserByNicknameUseCase: GetUserByNicknameUseCase,
    @Inject(DIToken.CategoryModule.GetCategoryUseCase)
    private readonly getCategoryUseCase: GetCategoryUseCase,
  ) {}

  @ApiOperation({
    summary: "카테고리 단건 조회",
    description: "카테고리 단건 조회",
  })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ type: GetCategoryDto })
  @UseGuards(JwtAuthGuard)
  @Get(":id")
  public async getOne(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Param("id", ParseCategoryIdPipe) id: CategoryId,
  ): Promise<GetCategoryDto> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );

    const category = await this.getCategoryUseCase.invoke(id, user.getId);
    return GetCategoryDto.from(category);
  }
}
