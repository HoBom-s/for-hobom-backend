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
import { JwtAuthGuard } from "../../../../../shared/adpaters/in/rest/guard/jwt-auth.guard";
import {
  NicknameAndAccessToken,
  TokenUserInformation,
} from "../../../../../shared/adpaters/in/rest/decorator/access-token.decorator";
import { ParseDailyTodoIdPipe } from "../pipe/daily-todo-id.pipe";
import { DailyTodoId } from "../../../domain/vo/daily-todo-id.vo";
import { UpdateDailyTodoCycleDto } from "../dto/update-daily-todo-cycle.dto";
import { UserNickname } from "../../../../user/domain/model/user-nickname.vo";
import { UpdateDailyTodoCycleCommand } from "../../../application/command/update-daily-todo-cycle.command";
import { UpdateDailyTodoCycleUseCase } from "../../../application/ports/in/update-daily-todo-cycle.use-case";

@ApiTags("DailyTodos")
@Controller(`${EndPointPrefixConstant}/daily-todos`)
export class UpdateDailyTodoCycleStatusController {
  constructor(
    @Inject(DIToken.UserModule.GetUserByNicknameUseCase)
    private readonly getUserByNicknameUseCase: GetUserByNicknameUseCase,
    @Inject(DIToken.DailyTodoModule.UpdateDailyTodoCycleUseCase)
    private readonly updateDailyTodoCycleUseCase: UpdateDailyTodoCycleUseCase,
  ) {}

  @ApiOperation({
    summary: "데일리 투두 반복 주기 변경",
    description: "데일리 투두 반복 주기 변경",
  })
  @UseGuards(JwtAuthGuard)
  @Patch("/:id/cycle-status")
  public async changeCycleStatus(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Param("id", ParseDailyTodoIdPipe) id: DailyTodoId,
    @Body() body: UpdateDailyTodoCycleDto,
  ): Promise<void> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );

    await this.updateDailyTodoCycleUseCase.invoke(
      id,
      user.getId,
      UpdateDailyTodoCycleCommand.of(body.cycle),
    );
  }
}
