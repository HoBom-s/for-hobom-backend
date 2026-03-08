import {
  Controller,
  Get,
  Inject,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Types } from "mongoose";
import { EndPointPrefixConstant } from "../../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../../shared/di/token.di";
import { JwtAuthGuard } from "../../../../../shared/adapters/in/rest/guard/jwt-auth.guard";
import {
  NicknameAndAccessToken,
  TokenUserInformation,
} from "../../../../../shared/adapters/in/rest/decorator/access-token.decorator";
import { GetUserByNicknameUseCase } from "../../../../user/domain/ports/in/get-user-by-nickname.use-case";
import { UserNickname } from "../../../../user/domain/model/user-nickname.vo";
import {
  DashboardPeriod,
  SystemDashboardPeriod,
} from "../../../domain/enums/dashboard-period.enum";
import { GetDailyTodoDashboardUseCase } from "../../../domain/ports/in/get-daily-todo-dashboard.use-case";
import { GetNoteDashboardUseCase } from "../../../domain/ports/in/get-note-dashboard.use-case";
import { GetFutureMessageDashboardUseCase } from "../../../domain/ports/in/get-future-message-dashboard.use-case";
import { GetNotificationDashboardUseCase } from "../../../domain/ports/in/get-notification-dashboard.use-case";
import { GetSystemDashboardUseCase } from "../../../domain/ports/in/get-system-dashboard.use-case";
import { GetActivityDashboardUseCase } from "../../../domain/ports/in/get-activity-dashboard.use-case";
import { GetProjectIssueDashboardUseCase } from "../../../domain/ports/in/get-project-issue-dashboard.use-case";
import { GetSprintDashboardUseCase } from "../../../domain/ports/in/get-sprint-dashboard.use-case";
import { ProjectId } from "../../../../project/domain/model/project-id.vo";
import { DailyTodoDashboardDto } from "./dto/daily-todo-dashboard.dto";
import { NoteDashboardDto } from "./dto/note-dashboard.dto";
import { FutureMessageDashboardDto } from "./dto/future-message-dashboard.dto";
import { NotificationDashboardDto } from "./dto/notification-dashboard.dto";
import { SystemDashboardDto } from "./dto/system-dashboard.dto";
import { ActivityDashboardDto } from "./dto/activity-dashboard.dto";
import { ProjectIssueDashboardDto } from "./dto/project-issue-dashboard.dto";
import { SprintDashboardDto } from "./dto/sprint-dashboard.dto";

@ApiTags("Dashboard")
@Controller(`${EndPointPrefixConstant}/dashboard`)
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    @Inject(DIToken.UserModule.GetUserByNicknameUseCase)
    private readonly getUserByNicknameUseCase: GetUserByNicknameUseCase,
    @Inject(DIToken.DashboardModule.GetDailyTodoDashboardUseCase)
    private readonly getDailyTodoDashboardUseCase: GetDailyTodoDashboardUseCase,
    @Inject(DIToken.DashboardModule.GetNoteDashboardUseCase)
    private readonly getNoteDashboardUseCase: GetNoteDashboardUseCase,
    @Inject(DIToken.DashboardModule.GetFutureMessageDashboardUseCase)
    private readonly getFutureMessageDashboardUseCase: GetFutureMessageDashboardUseCase,
    @Inject(DIToken.DashboardModule.GetNotificationDashboardUseCase)
    private readonly getNotificationDashboardUseCase: GetNotificationDashboardUseCase,
    @Inject(DIToken.DashboardModule.GetSystemDashboardUseCase)
    private readonly getSystemDashboardUseCase: GetSystemDashboardUseCase,
    @Inject(DIToken.DashboardModule.GetActivityDashboardUseCase)
    private readonly getActivityDashboardUseCase: GetActivityDashboardUseCase,
    @Inject(DIToken.DashboardModule.GetProjectIssueDashboardUseCase)
    private readonly getProjectIssueDashboardUseCase: GetProjectIssueDashboardUseCase,
    @Inject(DIToken.DashboardModule.GetSprintDashboardUseCase)
    private readonly getSprintDashboardUseCase: GetSprintDashboardUseCase,
  ) {}

  @ApiOperation({ summary: "데일리 투두 대시보드" })
  @ApiQuery({ name: "period", enum: DashboardPeriod, required: false })
  @ApiQuery({ name: "date", type: String, required: false })
  @ApiResponse({ type: DailyTodoDashboardDto })
  @Get("daily-todos")
  public async getDailyTodoDashboard(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Query("period") period?: string,
    @Query("date") date?: string,
  ): Promise<DailyTodoDashboardDto> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );
    const result = await this.getDailyTodoDashboardUseCase.invoke(
      user.getId,
      this.parsePeriod(period),
      this.parseDate(date),
    );
    return DailyTodoDashboardDto.from(result);
  }

  @ApiOperation({ summary: "노트 대시보드" })
  @ApiResponse({ type: NoteDashboardDto })
  @Get("notes")
  public async getNoteDashboard(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
  ): Promise<NoteDashboardDto> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );
    const result = await this.getNoteDashboardUseCase.invoke(user.getId);
    return NoteDashboardDto.from(result);
  }

  @ApiOperation({ summary: "미래 메시지 대시보드" })
  @ApiResponse({ type: FutureMessageDashboardDto })
  @Get("future-messages")
  public async getFutureMessageDashboard(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
  ): Promise<FutureMessageDashboardDto> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );
    const result = await this.getFutureMessageDashboardUseCase.invoke(
      user.getId,
    );
    return FutureMessageDashboardDto.from(result);
  }

  @ApiOperation({ summary: "알림 대시보드" })
  @ApiQuery({ name: "period", enum: DashboardPeriod, required: false })
  @ApiQuery({ name: "date", type: String, required: false })
  @ApiResponse({ type: NotificationDashboardDto })
  @Get("notifications")
  public async getNotificationDashboard(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Query("period") period?: string,
    @Query("date") date?: string,
  ): Promise<NotificationDashboardDto> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );
    const result = await this.getNotificationDashboardUseCase.invoke(
      user.getId,
      this.parsePeriod(period),
      this.parseDate(date),
    );
    return NotificationDashboardDto.from(result);
  }

  @ApiOperation({ summary: "시스템 대시보드" })
  @ApiQuery({ name: "period", enum: SystemDashboardPeriod, required: false })
  @ApiResponse({ type: SystemDashboardDto })
  @Get("system")
  public async getSystemDashboard(
    @Query("period") period?: string,
  ): Promise<SystemDashboardDto> {
    const result = await this.getSystemDashboardUseCase.invoke(
      this.parseSystemPeriod(period),
    );
    return SystemDashboardDto.from(result);
  }

  @ApiOperation({ summary: "활동 대시보드" })
  @ApiQuery({ name: "period", enum: DashboardPeriod, required: false })
  @ApiQuery({ name: "date", type: String, required: false })
  @ApiResponse({ type: ActivityDashboardDto })
  @Get("activity")
  public async getActivityDashboard(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Query("period") period?: string,
    @Query("date") date?: string,
  ): Promise<ActivityDashboardDto> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );
    const result = await this.getActivityDashboardUseCase.invoke(
      user.getId,
      this.parsePeriod(period),
      this.parseDate(date),
    );
    return ActivityDashboardDto.from(result);
  }

  @ApiOperation({ summary: "프로젝트 이슈 대시보드" })
  @ApiParam({ name: "projectId", type: String })
  @ApiResponse({ type: ProjectIssueDashboardDto })
  @Get("projects/:projectId/issues")
  public async getProjectIssueDashboard(
    @Param("projectId") projectId: string,
  ): Promise<ProjectIssueDashboardDto> {
    const result = await this.getProjectIssueDashboardUseCase.invoke(
      ProjectId.fromString(projectId),
    );
    return ProjectIssueDashboardDto.from(result);
  }

  @ApiOperation({ summary: "스프린트 대시보드" })
  @ApiParam({ name: "projectId", type: String })
  @ApiParam({ name: "sprintId", type: String })
  @ApiResponse({ type: SprintDashboardDto })
  @Get("projects/:projectId/sprints/:sprintId")
  public async getSprintDashboard(
    @Param("projectId") projectId: string,
    @Param("sprintId") sprintId: string,
  ): Promise<SprintDashboardDto> {
    const result = await this.getSprintDashboardUseCase.invoke(
      ProjectId.fromString(projectId),
      new Types.ObjectId(sprintId),
    );
    return SprintDashboardDto.from(result);
  }

  private parsePeriod(period?: string): DashboardPeriod {
    if (
      period &&
      Object.values(DashboardPeriod).includes(period as DashboardPeriod)
    ) {
      return period as DashboardPeriod;
    }
    return DashboardPeriod.WEEKLY;
  }

  private parseSystemPeriod(period?: string): SystemDashboardPeriod {
    if (
      period &&
      Object.values(SystemDashboardPeriod).includes(
        period as SystemDashboardPeriod,
      )
    ) {
      return period as SystemDashboardPeriod;
    }
    return SystemDashboardPeriod.LAST_24H;
  }

  private parseDate(date?: string): Date {
    if (date) {
      const parsed = new Date(date + "T00:00:00+09:00");
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  }
}
