import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Controller, Get, Inject, Query, UseGuards } from "@nestjs/common";
import { EndPointPrefixConstant } from "../../../../../shared/constants/end-point-prefix.constant";
import { GetDailyTodoDto } from "../dto/get-daily-todo.dto";
import { JwtAuthGuard } from "../../../../../shared/adapters/in/rest/guard/jwt-auth.guard";
import { ParseYearMonthDayStringPipe } from "../pipe/year-month-day-string.pipe";
import { YearMonthDayString } from "../../../domain/vo/year-month-day-string.vo";
import {
  NicknameAndAccessToken,
  TokenUserInformation,
} from "../../../../../shared/adapters/in/rest/decorator/access-token.decorator";
import { UserNickname } from "../../../../user/domain/model/user-nickname.vo";
import { DIToken } from "../../../../../shared/di/token.di";
import { GetUserByNicknameUseCase } from "../../../../user/domain/ports/in/get-user-by-nickname.use-case";
import { GetAllDailyTodoUseCase } from "../../../application/ports/in/get-all-daily-todo.use-case";

@ApiTags("DailyTodos")
@Controller(`${EndPointPrefixConstant}/daily-todos`)
export class GetAllDailyTodoController {
  constructor(
    @Inject(DIToken.UserModule.GetUserByNicknameUseCase)
    private readonly getUserByNicknameUseCase: GetUserByNicknameUseCase,
    @Inject(DIToken.DailyTodoModule.GetAllDailyTodoUseCase)
    private readonly getAllDailyTodoUseCase: GetAllDailyTodoUseCase,
  ) {}

  @ApiOperation({
    summary: "데일리 투두 모두 조회",
    description: "데일리 투두 모두 조회",
  })
  @ApiResponse({ type: [GetDailyTodoDto] })
  @ApiQuery({ name: "date", type: String })
  @UseGuards(JwtAuthGuard)
  @Get("")
  public async findAll(
    @Query("date", ParseYearMonthDayStringPipe) date: YearMonthDayString,
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
  ): Promise<GetDailyTodoDto[]> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );

    const dailyTodos = await this.getAllDailyTodoUseCase.invoke(
      user.getId,
      date,
    );

    return dailyTodos.map(GetDailyTodoDto.from);
  }
}
