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
import { UpdateDailyTodoDto } from "../dto/update-daily-todo.dto";
import { UserNickname } from "../../../../user/domain/model/user-nickname.vo";
import { UpdateDailyTodoCommand } from "../../../application/command/update-daily-todo.command";
import { UpdateDailyTodoUseCase } from "../../../application/ports/in/update-daily-todo.use-case";
import { CategoryId } from "../../../../category/domain/model/category-id.vo";
import { DateHelper } from "../../../../../shared/date/date.helper";

@ApiTags("DailyTodos")
@Controller(`${EndPointPrefixConstant}/daily-todos`)
export class UpdateDailyTodoController {
  constructor(
    @Inject(DIToken.UserModule.GetUserByNicknameUseCase)
    private readonly getUserByNicknameUseCase: GetUserByNicknameUseCase,
    @Inject(DIToken.DailyTodoModule.UpdateDailyTodoUseCase)
    private readonly updateDailyTodoUseCase: UpdateDailyTodoUseCase,
  ) {}

  @ApiOperation({
    summary: "데일리 투두 수정",
    description: "데일리 투두 수정 (제목, 날짜, 카테고리)",
  })
  @UseGuards(JwtAuthGuard)
  @Patch("/:id")
  public async update(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Param("id", ParseDailyTodoIdPipe) id: DailyTodoId,
    @Body() body: UpdateDailyTodoDto,
  ): Promise<void> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );

    await this.updateDailyTodoUseCase.invoke(
      id,
      user.getId,
      UpdateDailyTodoCommand.of(
        body.title,
        body.date != null ? DateHelper.parse(body.date, "KST") : undefined,
        body.category != null
          ? CategoryId.fromString(body.category)
          : undefined,
      ),
    );
  }
}
