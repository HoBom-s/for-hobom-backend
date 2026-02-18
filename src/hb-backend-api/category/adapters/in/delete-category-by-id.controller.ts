import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { Controller, Delete, Inject, Param, UseGuards } from "@nestjs/common";
import { EndPointPrefixConstant } from "../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../shared/di/token.di";
import { GetUserByNicknameUseCase } from "../../../user/domain/ports/in/get-user-by-nickname.use-case";
import {
  NicknameAndAccessToken,
  TokenUserInformation,
} from "../../../../shared/adapters/in/rest/decorator/access-token.decorator";
import { UserNickname } from "../../../user/domain/model/user-nickname.vo";
import { JwtAuthGuard } from "../../../../shared/adapters/in/rest/guard/jwt-auth.guard";
import { ParseCategoryIdPipe } from "./category-id.pipe";
import { CategoryId } from "../../domain/model/category-id.vo";
import { DeleteCategoryUseCase } from "../../domain/ports/in/delete-category.use-case";

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
