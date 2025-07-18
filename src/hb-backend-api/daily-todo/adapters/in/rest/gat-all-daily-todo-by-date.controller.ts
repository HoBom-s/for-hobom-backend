import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Controller, Get, Inject, Param, UseGuards } from "@nestjs/common";
import { EndPointPrefixConstant } from "../../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../../shared/di/token.di";
import { GetUserByNicknameUseCase } from "../../../../user/domain/ports/in/get-user-by-nickname.use-case";
import { GetDailyTodoByDateUseCase } from "../../../application/ports/in/get-daily-todo-by-date.use-case";
import { GetDailyTodoDto } from "../dto/get-daily-todo.dto";
import { JwtAuthGuard } from "../../../../../shared/adpaters/in/rest/guard/jwt-auth.guard";
import { ParseYearMonthDayStringPipe } from "../pipe/year-month-day-string.pipe";
import { YearMonthDayString } from "../../../domain/vo/year-month-day-string.vo";
import {
  NicknameAndAccessToken,
  TokenUserInformation,
} from "../../../../../shared/adpaters/in/rest/decorator/access-token.decorator";
import { UserNickname } from "../../../../user/domain/model/user-nickname.vo";

@ApiTags("DailyTodos")
@Controller(`${EndPointPrefixConstant}/daily-todos`)
export class GetAllDailyTodoByDateController {
  constructor(
    @Inject(DIToken.UserModule.GetUserByNicknameUseCase)
    private readonly getUserByNicknameUseCase: GetUserByNicknameUseCase,
    @Inject(DIToken.DailyTodoModule.GetDailyTodoByDateUseCase)
    private readonly getDailyTodoByDateUseCase: GetDailyTodoByDateUseCase,
  ) {}

  @ApiOperation({
    summary: "데일리 투두 날짜로 조회",
    description: "데일리 투두 날짜로 조회",
  })
  @ApiResponse({ type: [GetDailyTodoDto] })
  @UseGuards(JwtAuthGuard)
  @Get("/by-date/:date")
  public async findByDate(
    @Param("date", ParseYearMonthDayStringPipe) date: YearMonthDayString,
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
  ): Promise<GetDailyTodoDto[]> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );

    const dailyTodos = await this.getDailyTodoByDateUseCase.invoke(
      user.getId,
      date,
    );

    return dailyTodos.map(GetDailyTodoDto.from);
  }
}
