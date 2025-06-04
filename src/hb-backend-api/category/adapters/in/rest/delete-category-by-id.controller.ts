import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { Controller, Delete, Inject, Param, UseGuards } from "@nestjs/common";
import { EndPointPrefixConstant } from "../../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../../shared/di/token.di";
import { GetUserByNicknameUseCase } from "../../../../user/application/ports/in/get-user-by-nickname.use-case";
import {
  NicknameAndAccessToken,
  TokenUserInformation,
} from "../../../../../shared/adpaters/in/rest/decorator/access-token.decorator";
import { UserNickname } from "../../../../user/domain/vo/user-nickname.vo";
import { JwtAuthGuard } from "../../../../../shared/adpaters/in/rest/guard/jwt-auth.guard";
import { ParseCategoryIdPipe } from "../pipe/category-id.pipe";
import { CategoryId } from "../../../domain/vo/category-id.vo";
import { DeleteCategoryUseCase } from "../../../application/ports/in/delete-category.use-case";

@ApiTags("Categories")
@Controller(`${EndPointPrefixConstant}/categories`)
export class DeleteCategoryByIdController {
  constructor(
    @Inject(DIToken.UserModule.GetUserByNicknameUseCase)
    private readonly getUserByNicknameUseCase: GetUserByNicknameUseCase,
    @Inject(DIToken.CategoryModule.DeleteCategoryUseCase)
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
  ) {}

  @ApiOperation({
    summary: "카테고리 삭제",
    description: "카테고리 삭제",
  })
  @ApiParam({ name: "id", type: String })
  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  public async deleteCategory(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Param("id", ParseCategoryIdPipe) id: CategoryId,
  ): Promise<void> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );

    await this.deleteCategoryUseCase.invoke(id, user.getId);
  }
}
