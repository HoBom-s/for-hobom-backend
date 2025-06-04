import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Controller, Get, Inject, Param, UseGuards } from "@nestjs/common";
import { EndPointPrefixConstant } from "../../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../../shared/di/token.di";
import { GetUserByNicknameUseCase } from "../../../../user/application/ports/in/get-user-by-nickname.use-case";
import { GetDailyTodoDto } from "../dto/get-daily-todo.dto";
import { JwtAuthGuard } from "../../../../../shared/adpaters/in/rest/guard/jwt-auth.guard";
import { ParseDailyTodoIdPipe } from "../pipe/daily-todo-id.pipe";
import { DailyTodoId } from "../../../domain/vo/daily-todo-id.vo";
import {
  NicknameAndAccessToken,
  TokenUserInformation,
} from "../../../../../shared/adpaters/in/rest/decorator/access-token.decorator";
import { UserNickname } from "../../../../user/domain/vo/user-nickname.vo";
import { GetDailyTodoUseCase } from "../../../application/ports/in/get-daily-todo.use-case";

@ApiTags("DailyTodos")
@Controller(`${EndPointPrefixConstant}/daily-todos`)
export class GetDailyTodoByIdController {
  constructor(
    @Inject(DIToken.UserModule.GetUserByNicknameUseCase)
    private readonly getUserByNicknameUseCase: GetUserByNicknameUseCase,
    @Inject(DIToken.DailyTodoModule.GetDailyTodoUseCase)
    private readonly getDailyTodoUseCase: GetDailyTodoUseCase,
  ) {}

  @ApiOperation({
    summary: "데일리 투두 단건 조회",
    description: "데일리 투두 단건 조회",
  })
  @ApiResponse({ type: GetDailyTodoDto })
  @ApiParam({ name: "id", type: String })
  @UseGuards(JwtAuthGuard)
  @Get(":id")
  public async findById(
    @Param("id", ParseDailyTodoIdPipe) id: DailyTodoId,
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
  ): Promise<GetDailyTodoDto> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );

    const dailyTodo = await this.getDailyTodoUseCase.invoke(id, user.getId);

    return GetDailyTodoDto.from(dailyTodo);
  }
}
