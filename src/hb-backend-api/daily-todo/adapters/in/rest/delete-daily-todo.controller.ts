import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Controller, Delete, Inject, Param, UseGuards } from "@nestjs/common";
import { EndPointPrefixConstant } from "../../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../../shared/di/token.di";
import { GetUserByNicknameUseCase } from "../../../../user/domain/ports/in/get-user-by-nickname.use-case";
import { JwtAuthGuard } from "../../../../../shared/adapters/in/rest/guard/jwt-auth.guard";
import { DeleteDailyTodoUseCase } from "src/hb-backend-api/daily-todo/application/ports/in/delete-daily-todo.use-case";
import {
  NicknameAndAccessToken,
  TokenUserInformation,
} from "../../../../../shared/adapters/in/rest/decorator/access-token.decorator";
import { ParseDailyTodoIdPipe } from "../pipe/daily-todo-id.pipe";
import { DailyTodoId } from "../../../domain/vo/daily-todo-id.vo";
import { UserNickname } from "../../../../user/domain/model/user-nickname.vo";

@ApiTags("DailyTodos")
@Controller(`${EndPointPrefixConstant}/daily-todos`)
export class DeleteDailyTodoController {
  constructor(
    @Inject(DIToken.UserModule.GetUserByNicknameUseCase)
    private readonly getUserByNicknameUseCase: GetUserByNicknameUseCase,
    @Inject(DIToken.DailyTodoModule.DeleteDailyTodoUseCase)
    private readonly deleteDailyTodoUseCase: DeleteDailyTodoUseCase,
  ) {}

  @ApiOperation({
    summary: "데일리 삭제",
    description: "데일리 삭제",
  })
  @UseGuards(JwtAuthGuard)
  @Delete("/:id")
  public async deleteDailyTodo(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Param("id", ParseDailyTodoIdPipe) id: DailyTodoId,
  ): Promise<void> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );

    await this.deleteDailyTodoUseCase.invoke(id, user.getId);
  }
}
