import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Body, Controller, Inject, Post } from "@nestjs/common";
import { EndPointPrefixConstant } from "../../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../../shared/di/token.di";
import { CreateCategoryUseCase } from "../../../application/ports/in/create-category.use-case";
import { ResponseEntity } from "../../../../../shared/response/response.entity";
import { CreateCategoryDto } from "../dto/create-category.dto";
import { GetUserByNicknameUseCase } from "../../../../user/application/ports/in/get-user-by-nickname.use-case";
import {
  NicknameAndAccessToken,
  TokenUserInformation,
} from "../../../../../shared/adpaters/in/rest/decorator/access-token.decorator";
import { UserNickname } from "../../../../user/domain/vo/user-nickname.vo";
import { CreateCategoryCommand } from "../../../application/command/create-category.command";

@ApiTags("Category")
@Controller(`${EndPointPrefixConstant}/categories`)
export class CategoryController {
  constructor(
    @Inject(DIToken.CategoryModule.CreateCategoryUseCase)
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    @Inject(DIToken.UserModule.GetUserByNicknameUseCase)
    private readonly getUserByNicknameUseCase: GetUserByNicknameUseCase,
  ) {}

  @ApiOperation({ description: "카테고리 생성" })
  @Post("")
  public async createCategory(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Body() body: CreateCategoryDto,
  ): Promise<ResponseEntity<void>> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );

    await this.createCategoryUseCase.invoke(
      CreateCategoryCommand.of(body.title, user.getId),
    );

    return ResponseEntity.ok<void>(undefined);
  }
}
