import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { DIToken } from "../../../../../shared/di/token.di";
import { CreateDailyTodoUseCase } from "../../../application/ports/in/create-daily-todo.use-case";
import { JwtAuthGuard } from "../../../../../shared/adpaters/in/rest/guard/jwt-auth.guard";
import {
  NicknameAndAccessToken,
  TokenUserInformation,
} from "../../../../../shared/adpaters/in/rest/decorator/access-token.decorator";
import { CreateDailyTodoDto } from "../dto/create-daily-todo.dto";
import { GetUserByNicknameUseCase } from "../../../../user/application/ports/in/get-user-by-nickname.use-case";
import { UserNickname } from "../../../../user/domain/vo/user-nickname.vo";
import { CreateDailyTodoCommand } from "../../../application/command/create-daily-todo.command";
import { CategoryId } from "../../../../category/domain/vo/category-id.vo";
import { EndPointPrefixConstant } from "../../../../../shared/constants/end-point-prefix.constant";
import { DateHelper } from "../../../../../shared/date/date.helper";
import { GetAllDailyTodoUseCase } from "../../../application/ports/in/get-all-daily-todo.use-case";
import { GetDailyTodoDto } from "../dto/get-daily-todo.dto";
import { ParseYearMonthDayStringPipe } from "../pipe/year-month-day-string.pipe";
import { YearMonthDayString } from "../../../domain/vo/year-month-day-string.vo";
import { ParseDailyTodoIdPipe } from "../pipe/daily-todo-id.pipe";
import { DailyTodoId } from "../../../domain/vo/daily-todo-id.vo";
import { GetDailyTodoUseCase } from "../../../application/ports/in/get-daily-todo.use-case";
import { UpdateDailyTodoCompleteStatusUseCase } from "../../../application/ports/in/update-daily-todo-complete-status.use-case";
import { UpdateDailyTodoCompleteStatusDto } from "../dto/update-daily-todo-complete-status.dto";
import { UpdateDailyTodoCompleteStatusCommand } from "../../../application/command/update-daily-todo-complete-status.command";
import { UpdateDailyTodoCycleDto } from "../dto/update-daily-todo-cycle.dto";
import { UpdateDailyTodoCycleUseCase } from "../../../application/ports/in/update-daily-todo-cycle.use-case";
import { UpdateDailyTodoCycleCommand } from "../../../application/command/update-daily-todo-cycle.command";
import { UpdateDailyTodoReactionDto } from "../dto/update-daily-todo-reaction.dto";
import { UpdateDailyTodoReactionUseCase } from "../../../application/ports/in/update-daily-todo-reaction.use-case";
import { UpdateDailyTodoReactionCommand } from "../../../application/command/update-daily-todo-reaction.command";

@ApiTags("DailyTodos")
@Controller(`${EndPointPrefixConstant}/daily-todos`)
export class DailyTodoController {
  constructor(
    @Inject(DIToken.UserModule.GetUserByNicknameUseCase)
    private readonly getUserByNicknameUseCase: GetUserByNicknameUseCase,
    @Inject(DIToken.DailyTodoModule.CreateDailyTodoUseCase)
    private readonly createDailyTOdoUseCase: CreateDailyTodoUseCase,
    @Inject(DIToken.DailyTodoModule.GetAllDailyTodoUseCase)
    private readonly getAllDailyTodoUseCase: GetAllDailyTodoUseCase,
    @Inject(DIToken.DailyTodoModule.GetDailyTodoUseCase)
    private readonly getDailyTodoUseCase: GetDailyTodoUseCase,
    @Inject(DIToken.DailyTodoModule.UpdateDailyTodoCompleteStatusUseCase)
    private readonly updateDailyTodoCompleteStatusUseCase: UpdateDailyTodoCompleteStatusUseCase,
    @Inject(DIToken.DailyTodoModule.UpdateDailyTodoCycleUseCase)
    private readonly updateDailyTodoCycleUseCase: UpdateDailyTodoCycleUseCase,
    @Inject(DIToken.DailyTodoModule.UpdateDailyTodoReactionUseCase)
    private readonly updateDailyTodoReaction: UpdateDailyTodoReactionUseCase,
  ) {}

  @ApiOperation({ description: "데일리 투두 모두 조회" })
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

  @ApiOperation({ description: "데일리 투두 단건 조회" })
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

  @ApiOperation({ description: "데일리 투두 생성" })
  @UseGuards(JwtAuthGuard)
  @Post("")
  public async create(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Body() body: CreateDailyTodoDto,
  ): Promise<void> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );

    const categoryId =
      body.category == null ? null : CategoryId.fromString(body.category);

    await this.createDailyTOdoUseCase.invoke(
      CreateDailyTodoCommand.of(
        body.title,
        DateHelper.parse(body.date, "KST"),
        categoryId,
      ),
      user.getId,
    );
  }

  @ApiOperation({ description: "데일리 투두 완료 상태 변경" })
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

  @ApiOperation({ description: "데일리 투두 반복 주기 변경" })
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

  @ApiOperation({ description: "데일리 투두 리액션 변경" })
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

    await this.updateDailyTodoReaction.invoke(
      id,
      user.getId,
      UpdateDailyTodoReactionCommand.of(body.reaction),
    );
  }
}
