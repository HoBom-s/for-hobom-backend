import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import {
  Body,
  Controller,
  Inject,
  Param,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { EndPointPrefixConstant } from "../../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../../shared/di/token.di";
import { GetUserByNicknameUseCase } from "../../../../user/application/ports/in/get-user-by-nickname.use-case";
import { PatchCategoryUseCase } from "../../../application/ports/in/patch-category.use-case";
import { JwtAuthGuard } from "../../../../../shared/adpaters/in/rest/guard/jwt-auth.guard";
import {
  NicknameAndAccessToken,
  TokenUserInformation,
} from "../../../../../shared/adpaters/in/rest/decorator/access-token.decorator";
import { ParseCategoryIdPipe } from "../pipe/category-id.pipe";
import { CategoryId } from "../../../domain/vo/category-id.vo";
import { PatchCategoryDto } from "../dto/patch-category.dto";
import { UserNickname } from "../../../../user/domain/vo/user-nickname.vo";
import { PatchCategoryCommand } from "../../../application/command/patch-category.command";
import { CategoryTitle } from "../../../domain/vo/category-title.vo";

@ApiTags("Categories")
@Controller(`${EndPointPrefixConstant}/categories`)
export class UpdateCategoryTitleController {
  constructor(
    @Inject(DIToken.UserModule.GetUserByNicknameUseCase)
    private readonly getUserByNicknameUseCase: GetUserByNicknameUseCase,
    @Inject(DIToken.CategoryModule.PatchCategoryUseCase)
    private readonly patchCategoryUseCase: PatchCategoryUseCase,
  ) {}

  @ApiOperation({
    summary: "카테고리 수정",
    description: "카테고리 수정",
  })
  @ApiParam({ name: "id", type: String })
  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  public async updateCategory(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Param("id", ParseCategoryIdPipe) id: CategoryId,
    @Body() body: PatchCategoryDto,
  ): Promise<void> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );

    await this.patchCategoryUseCase.invoke(
      id,
      PatchCategoryCommand.of(CategoryTitle.fromString(body.title), user.getId),
    );
  }
}
