import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
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
import { PatchCategoryUseCase } from "../../../application/ports/in/patch-category.use-case";
import { PatchCategoryDto } from "../dto/patch-category.dto";
import { JwtAuthGuard } from "../../../../../shared/adpaters/in/rest/guard/jwt-auth.guard";
import { ParseCategoryIdPipe } from "../pipe/category-id.pipe";
import { CategoryId } from "../../../domain/vo/category-id.vo";
import { PatchCategoryCommand } from "../../../application/command/patch-category.command";
import { GetCategoryUseCase } from "../../../application/ports/in/get-category.use-case";
import { DeleteCategoryUseCase } from "../../../application/ports/in/delete-category.use-case";

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
    @Inject(DIToken.CategoryModule.PatchCategoryUseCase)
    private readonly patchCategoryUseCase: PatchCategoryUseCase,
    @Inject(DIToken.CategoryModule.GetCategoryUseCase)
    private readonly getCategoryUseCase: GetCategoryUseCase,
    @Inject(DIToken.CategoryModule.DeleteCategoryUseCase)
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
  ) {}

  @ApiOperation({ description: "모든 카테고리 조회" })
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

  @ApiOperation({ description: "카테고리 단건 조회" })
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

  @ApiOperation({ description: "카테고리 생성" })
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

  @ApiOperation({ description: "카테고리 수정" })
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

  @ApiOperation({ description: "카테고리 삭제" })
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
