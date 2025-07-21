import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Controller, Get, Inject, UseGuards } from "@nestjs/common";
import { EndPointPrefixConstant } from "../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../shared/di/token.di";
import { GetUserByNicknameUseCase } from "../../../user/domain/ports/in/get-user-by-nickname.use-case";
import { GetAllCategoryUseCase } from "../../domain/ports/in/get-all-category.use-case";
import { GetCategoryDto } from "./get-category.dto";
import { JwtAuthGuard } from "../../../../shared/adpaters/in/rest/guard/jwt-auth.guard";
import {
  NicknameAndAccessToken,
  TokenUserInformation,
} from "../../../../shared/adpaters/in/rest/decorator/access-token.decorator";
import { UserNickname } from "../../../user/domain/model/user-nickname.vo";

@ApiTags("Categories")
@Controller(`${EndPointPrefixConstant}/categories`)
export class GetAllCategoryController {
  constructor(
    @Inject(DIToken.UserModule.GetUserByNicknameUseCase)
    private readonly getUserByNicknameUseCase: GetUserByNicknameUseCase,
    @Inject(DIToken.CategoryModule.GetAllCategoryUseCase)
    private readonly getAllCategoryUseCase: GetAllCategoryUseCase,
  ) {}

  @ApiOperation({
    summary: "모든 카테고리 조회",
    description: "모든 카테고리 조회",
  })
  @ApiResponse({ type: [GetCategoryDto] })
  @UseGuards(JwtAuthGuard)
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
}
