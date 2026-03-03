import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Types } from "mongoose";
import { EndPointPrefixConstant } from "../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../shared/di/token.di";
import { JwtAuthGuard } from "../../../../shared/adapters/in/rest/guard/jwt-auth.guard";
import {
  NicknameAndAccessToken,
  TokenUserInformation,
} from "../../../../shared/adapters/in/rest/decorator/access-token.decorator";
import { GetUserByNicknameUseCase } from "../../../user/domain/ports/in/get-user-by-nickname.use-case";
import { UserNickname } from "../../../user/domain/model/user-nickname.vo";
import { CreateIssueUseCase } from "../../ports/in/create-issue.use-case";
import { GetIssueUseCase } from "../../ports/in/get-issue.use-case";
import { GetIssuesByProjectUseCase } from "../../ports/in/get-issues-by-project.use-case";
import { UpdateIssueUseCase } from "../../ports/in/update-issue.use-case";
import { DeleteIssueUseCase } from "../../ports/in/delete-issue.use-case";
import { TransitionIssueStatusUseCase } from "../../ports/in/transition-issue-status.use-case";
import { AssignIssueUseCase } from "../../ports/in/assign-issue.use-case";
import { CreateIssueDto } from "./dto/create-issue.dto";
import { UpdateIssueDto } from "./dto/update-issue.dto";
import { TransitionIssueStatusDto } from "./dto/transition-issue-status.dto";
import { AssignIssueDto } from "./dto/assign-issue.dto";
import { GetIssueDto } from "./dto/get-issue.dto";
import { ParseIssueIdPipe } from "./parse-issue-id.pipe";
import { IssueId } from "../../domain/model/issue-id.vo";
import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { ParseProjectIdPipe } from "../../../project/adapters/in/parse-project-id.pipe";
import { IssuePriority } from "../../domain/enums/issue-priority.enum";
import { UserId } from "../../../user/domain/model/user-id.vo";

@ApiTags("Issues")
@Controller(`${EndPointPrefixConstant}/projects/:projectId/issues`)
@UseGuards(JwtAuthGuard)
export class IssueController {
  constructor(
    @Inject(DIToken.UserModule.GetUserByNicknameUseCase)
    private readonly getUserByNicknameUseCase: GetUserByNicknameUseCase,
    @Inject(DIToken.IssueModule.CreateIssueUseCase)
    private readonly createIssueUseCase: CreateIssueUseCase,
    @Inject(DIToken.IssueModule.GetIssueUseCase)
    private readonly getIssueUseCase: GetIssueUseCase,
    @Inject(DIToken.IssueModule.GetIssuesByProjectUseCase)
    private readonly getIssuesByProjectUseCase: GetIssuesByProjectUseCase,
    @Inject(DIToken.IssueModule.UpdateIssueUseCase)
    private readonly updateIssueUseCase: UpdateIssueUseCase,
    @Inject(DIToken.IssueModule.DeleteIssueUseCase)
    private readonly deleteIssueUseCase: DeleteIssueUseCase,
    @Inject(DIToken.IssueModule.TransitionIssueStatusUseCase)
    private readonly transitionIssueStatusUseCase: TransitionIssueStatusUseCase,
    @Inject(DIToken.IssueModule.AssignIssueUseCase)
    private readonly assignIssueUseCase: AssignIssueUseCase,
  ) {}

  @ApiOperation({ summary: "이슈 생성" })
  @ApiParam({ name: "projectId", type: String })
  @Post("")
  public async create(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Param("projectId", ParseProjectIdPipe) projectId: ProjectId,
    @Body() dto: CreateIssueDto,
  ): Promise<void> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );
    await this.createIssueUseCase.invoke(
      projectId,
      dto.type,
      dto.title,
      dto.description ?? null,
      dto.priority ?? IssuePriority.MEDIUM,
      user.getId,
      dto.assignee != null ? UserId.fromString(dto.assignee) : null,
      dto.sprint != null ? new Types.ObjectId(dto.sprint) : null,
      dto.parent != null ? new Types.ObjectId(dto.parent) : null,
      dto.labels ?? [],
    );
  }

  @ApiOperation({ summary: "프로젝트별 이슈 목록 조회" })
  @ApiParam({ name: "projectId", type: String })
  @ApiResponse({ type: [GetIssueDto] })
  @Get("")
  public async getByProject(
    @Param("projectId", ParseProjectIdPipe) projectId: ProjectId,
  ): Promise<GetIssueDto[]> {
    const issues = await this.getIssuesByProjectUseCase.invoke(projectId);
    return issues.map(GetIssueDto.from);
  }

  @ApiOperation({ summary: "이슈 단건 조회" })
  @ApiParam({ name: "projectId", type: String })
  @ApiParam({ name: "issueId", type: String })
  @ApiResponse({ type: GetIssueDto })
  @Get(":issueId")
  public async getOne(
    @Param("issueId", ParseIssueIdPipe) issueId: IssueId,
  ): Promise<GetIssueDto> {
    const issue = await this.getIssueUseCase.invoke(issueId);
    return GetIssueDto.from(issue);
  }

  @ApiOperation({ summary: "이슈 수정" })
  @ApiParam({ name: "projectId", type: String })
  @ApiParam({ name: "issueId", type: String })
  @Patch(":issueId")
  public async update(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Param("issueId", ParseIssueIdPipe) issueId: IssueId,
    @Body() dto: UpdateIssueDto,
  ): Promise<void> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );
    const data: Record<string, unknown> = {};
    if (dto.title != null) data.title = dto.title;
    if (dto.description != null) data.description = dto.description;
    if (dto.priority != null) data.priority = dto.priority;
    if (dto.sprint != null) data.sprint = new Types.ObjectId(dto.sprint);
    if (dto.storyPoints != null) data.storyPoints = dto.storyPoints;
    if (dto.labels != null) data.labels = dto.labels;
    if (dto.dueDate != null) data.dueDate = new Date(dto.dueDate);

    await this.updateIssueUseCase.invoke(issueId, user.getId, data);
  }

  @ApiOperation({ summary: "이슈 삭제" })
  @ApiParam({ name: "projectId", type: String })
  @ApiParam({ name: "issueId", type: String })
  @Delete(":issueId")
  public async delete(
    @Param("issueId", ParseIssueIdPipe) issueId: IssueId,
  ): Promise<void> {
    await this.deleteIssueUseCase.invoke(issueId);
  }

  @ApiOperation({ summary: "이슈 상태 전환" })
  @ApiParam({ name: "projectId", type: String })
  @ApiParam({ name: "issueId", type: String })
  @Post(":issueId/transition")
  public async transition(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Param("issueId", ParseIssueIdPipe) issueId: IssueId,
    @Body() dto: TransitionIssueStatusDto,
  ): Promise<void> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );
    await this.transitionIssueStatusUseCase.invoke(
      issueId,
      dto.statusId,
      user.getId,
    );
  }

  @ApiOperation({ summary: "이슈 담당자 변경" })
  @ApiParam({ name: "projectId", type: String })
  @ApiParam({ name: "issueId", type: String })
  @Patch(":issueId/assignee")
  public async assign(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Param("issueId", ParseIssueIdPipe) issueId: IssueId,
    @Body() dto: AssignIssueDto,
  ): Promise<void> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );
    await this.assignIssueUseCase.invoke(
      issueId,
      dto.assignee != null ? UserId.fromString(dto.assignee) : null,
      user.getId,
    );
  }
}
