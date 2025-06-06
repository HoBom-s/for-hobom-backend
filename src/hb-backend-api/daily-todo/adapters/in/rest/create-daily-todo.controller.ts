import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Body, Controller, Inject, Post, UseGuards } from "@nestjs/common";
import { EndPointPrefixConstant } from "../../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../../shared/di/token.di";
import { GetUserByNicknameUseCase } from "../../../../user/application/ports/in/get-user-by-nickname.use-case";
import { JwtAuthGuard } from "../../../../../shared/adpaters/in/rest/guard/jwt-auth.guard";
import {
  NicknameAndAccessToken,
  TokenUserInformation,
} from "../../../../../shared/adpaters/in/rest/decorator/access-token.decorator";
import { CreateDailyTodoDto } from "../dto/create-daily-todo.dto";
import { UserNickname } from "../../../../user/domain/vo/user-nickname.vo";
import { CategoryId } from "../../../../category/domain/vo/category-id.vo";
import { CreateDailyTodoCommand } from "../../../application/command/create-daily-todo.command";
import { DateHelper } from "../../../../../shared/date/date.helper";
import { CreateDailyTodoUseCase } from "../../../application/ports/in/create-daily-todo.use-case";

@ApiTags("DailyTodos")
@Controller(`${EndPointPrefixConstant}/daily-todos`)
export class CreateDailyTodoController {
  constructor(
    @Inject(DIToken.UserModule.GetUserByNicknameUseCase)
    private readonly getUserByNicknameUseCase: GetUserByNicknameUseCase,
    @Inject(DIToken.DailyTodoModule.CreateDailyTodoUseCase)
    private readonly createDailyTodoUseCase: CreateDailyTodoUseCase,
  ) {}

  @ApiOperation({
    summary: "데일리 투두 생성",
    description: "데일리 투두 생성",
  })
  @UseGuards(JwtAuthGuard)
  @Post("")
  public async create(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Body() body: CreateDailyTodoDto,
  ): Promise<void> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );

    const categoryId = CategoryId.fromString(body.category);

    await this.createDailyTodoUseCase.invoke(
      CreateDailyTodoCommand.of(
        body.title,
        DateHelper.parse(body.date, "KST"),
        categoryId,
      ),
      user.getId,
    );
  }
}
