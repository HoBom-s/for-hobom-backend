import {
  Body,
  Controller,
  Inject,
  Param,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { DIToken } from "../../../../../shared/di/token.di";
import { JwtAuthGuard } from "../../../../../shared/adpaters/in/rest/guard/jwt-auth.guard";
import {
  NicknameAndAccessToken,
  TokenUserInformation,
} from "../../../../../shared/adpaters/in/rest/decorator/access-token.decorator";
import { GetUserByNicknameUseCase } from "../../../../user/domain/ports/in/get-user-by-nickname.use-case";
import { UserNickname } from "../../../../user/domain/model/user-nickname.vo";
import { EndPointPrefixConstant } from "../../../../../shared/constants/end-point-prefix.constant";
import { ParseDailyTodoIdPipe } from "../pipe/daily-todo-id.pipe";
import { DailyTodoId } from "../../../domain/vo/daily-todo-id.vo";
import { UpdateDailyTodoReactionDto } from "../dto/update-daily-todo-reaction.dto";
import { UpdateDailyTodoReactionUseCase } from "../../../application/ports/in/update-daily-todo-reaction.use-case";
import { UpdateDailyTodoReactionCommand } from "../../../application/command/update-daily-todo-reaction.command";
import { Reaction } from "../../../domain/entity/daily-todo.retations";
import { UserId } from "../../../../user/domain/model/user-id.vo";

@ApiTags("DailyTodos")
@Controller(`${EndPointPrefixConstant}/daily-todos`)
export class UpdateDailyTodoReactionController {
  constructor(
    @Inject(DIToken.UserModule.GetUserByNicknameUseCase)
    private readonly getUserByNicknameUseCase: GetUserByNicknameUseCase,
    @Inject(DIToken.DailyTodoModule.UpdateDailyTodoReactionUseCase)
    private readonly updateDailyTodoReaction: UpdateDailyTodoReactionUseCase,
  ) {}

  @ApiOperation({
    summary: "데일리 투두 리액션 변경",
    description: "데일리 투두 리액션 변경",
  })
  @UseGuards(JwtAuthGuard)
  @Patch("/:id/reaction")
  public async updateReaction(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Param("id", ParseDailyTodoIdPipe) id: DailyTodoId,
    @Body() body: UpdateDailyTodoReactionDto,
  ): Promise<void> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );

    const reaction = Reaction.of(
      body.reaction,
      UserId.fromString(body.reactionUserId),
    );
    await this.updateDailyTodoReaction.invoke(
      id,
      user.getId,
      UpdateDailyTodoReactionCommand.of(reaction),
    );
  }
}
