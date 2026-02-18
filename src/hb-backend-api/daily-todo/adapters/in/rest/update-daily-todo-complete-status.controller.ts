import { ApiOperation, ApiTags } from "@nestjs/swagger";
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
import { GetUserByNicknameUseCase } from "../../../../user/domain/ports/in/get-user-by-nickname.use-case";
import { JwtAuthGuard } from "../../../../../shared/adapters/in/rest/guard/jwt-auth.guard";
import {
  NicknameAndAccessToken,
  TokenUserInformation,
} from "../../../../../shared/adapters/in/rest/decorator/access-token.decorator";
import { ParseDailyTodoIdPipe } from "../pipe/daily-todo-id.pipe";
import { DailyTodoId } from "../../../domain/vo/daily-todo-id.vo";
import { UpdateDailyTodoCompleteStatusDto } from "../dto/update-daily-todo-complete-status.dto";
import { UserNickname } from "../../../../user/domain/model/user-nickname.vo";
import { UpdateDailyTodoCompleteStatusCommand } from "../../../application/command/update-daily-todo-complete-status.command";
import { UpdateDailyTodoCompleteStatusUseCase } from "../../../application/ports/in/update-daily-todo-complete-status.use-case";

@ApiTags("DailyTodos")
@Controller(`${EndPointPrefixConstant}/daily-todos`)
export class UpdateDailyTodoCompleteStatusController {
  constructor(
    @Inject(DIToken.UserModule.GetUserByNicknameUseCase)
    private readonly getUserByNicknameUseCase: GetUserByNicknameUseCase,
    @Inject(DIToken.DailyTodoModule.UpdateDailyTodoCompleteStatusUseCase)
    private readonly updateDailyTodoCompleteStatusUseCase: UpdateDailyTodoCompleteStatusUseCase,
  ) {}

  @ApiOperation({
    summary: "데일리 투두 완료 상태 변경",
    description: "데일리 투두 완료 상태 변경",
  })
  @UseGuards(JwtAuthGuard)
  @Patch("/:id/complete-status")
  public async changeCompleteStatus(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Param("id", ParseDailyTodoIdPipe) id: DailyTodoId,
    @Body() body: UpdateDailyTodoCompleteStatusDto,
  ): Promise<void> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );

    await this.updateDailyTodoCompleteStatusUseCase.invoke(
      id,
      user.getId,
      UpdateDailyTodoCompleteStatusCommand.of(body.status),
    );
  }
}
