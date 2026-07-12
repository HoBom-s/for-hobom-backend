import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { EndPointPrefixConstant } from "../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../shared/di/token.di";
import { JwtAuthGuard } from "../../../../shared/adapters/in/rest/guard/jwt-auth.guard";
import {
  NicknameAndAccessToken,
  TokenUserInformation,
} from "../../../../shared/adapters/in/rest/decorator/access-token.decorator";
import { GetUserByNicknameUseCase } from "../../../user/domain/ports/in/get-user-by-nickname.use-case";
import { UserNickname } from "../../../user/domain/model/user-nickname.vo";
import { CreateProjectUseCase } from "../../ports/in/create-project.use-case";
import { GetProjectUseCase } from "../../ports/in/get-project.use-case";
import { GetMyProjectsUseCase } from "../../ports/in/get-my-projects.use-case";
import { UpdateProjectUseCase } from "../../ports/in/update-project.use-case";
import { DeleteProjectUseCase } from "../../ports/in/delete-project.use-case";
import { AddProjectMemberUseCase } from "../../ports/in/add-project-member.use-case";
import { RemoveProjectMemberUseCase } from "../../ports/in/remove-project-member.use-case";
import { UpdateProjectMemberRoleUseCase } from "../../ports/in/update-project-member-role.use-case";
import { UpdateProjectWorkflowUseCase } from "../../ports/in/update-project-workflow.use-case";
import { UpdateProjectIssueTypesUseCase } from "../../ports/in/update-project-issue-types.use-case";
import { UpdateProjectPrioritiesUseCase } from "../../ports/in/update-project-priorities.use-case";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { AddProjectMemberDto } from "./dto/add-project-member.dto";
import { UpdateProjectMemberRoleDto } from "./dto/update-project-member-role.dto";
import { UpdateProjectWorkflowDto } from "./dto/update-project-workflow.dto";
import { UpdateProjectIssueTypesDto } from "./dto/update-project-issue-types.dto";
import { UpdateProjectPrioritiesDto } from "./dto/update-project-priorities.dto";
import { GetProjectDto } from "./dto/get-project.dto";
import { ParseProjectIdPipe } from "./parse-project-id.pipe";
import { ProjectId } from "../../domain/model/project-id.vo";
import { ProjectKey } from "../../domain/model/project-key.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";

@ApiTags("Projects")
@Controller(`${EndPointPrefixConstant}/projects`)
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(
    @Inject(DIToken.UserModule.GetUserByNicknameUseCase)
    private readonly getUserByNicknameUseCase: GetUserByNicknameUseCase,
    @Inject(DIToken.ProjectModule.CreateProjectUseCase)
    private readonly createProjectUseCase: CreateProjectUseCase,
    @Inject(DIToken.ProjectModule.GetProjectUseCase)
    private readonly getProjectUseCase: GetProjectUseCase,
    @Inject(DIToken.ProjectModule.GetMyProjectsUseCase)
    private readonly getMyProjectsUseCase: GetMyProjectsUseCase,
    @Inject(DIToken.ProjectModule.UpdateProjectUseCase)
    private readonly updateProjectUseCase: UpdateProjectUseCase,
    @Inject(DIToken.ProjectModule.DeleteProjectUseCase)
    private readonly deleteProjectUseCase: DeleteProjectUseCase,
    @Inject(DIToken.ProjectModule.AddProjectMemberUseCase)
    private readonly addProjectMemberUseCase: AddProjectMemberUseCase,
    @Inject(DIToken.ProjectModule.RemoveProjectMemberUseCase)
    private readonly removeProjectMemberUseCase: RemoveProjectMemberUseCase,
    @Inject(DIToken.ProjectModule.UpdateProjectMemberRoleUseCase)
    private readonly updateProjectMemberRoleUseCase: UpdateProjectMemberRoleUseCase,
    @Inject(DIToken.ProjectModule.UpdateProjectWorkflowUseCase)
    private readonly updateProjectWorkflowUseCase: UpdateProjectWorkflowUseCase,
    @Inject(DIToken.ProjectModule.UpdateProjectIssueTypesUseCase)
    private readonly updateProjectIssueTypesUseCase: UpdateProjectIssueTypesUseCase,
    @Inject(DIToken.ProjectModule.UpdateProjectPrioritiesUseCase)
    private readonly updateProjectPrioritiesUseCase: UpdateProjectPrioritiesUseCase,
  ) {}

  @ApiOperation({ summary: "프로젝트 생성" })
  @Post("")
  public async create(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Body() dto: CreateProjectDto,
  ): Promise<void> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );
    await this.createProjectUseCase.invoke(
      ProjectKey.fromString(dto.key),
      dto.name,
      dto.description ?? null,
      user.getId,
    );
  }

  @ApiOperation({ summary: "내 프로젝트 목록 조회" })
  @ApiResponse({ type: [GetProjectDto] })
  @Get("me")
  public async getMyProjects(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
  ): Promise<GetProjectDto[]> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );
    const projects = await this.getMyProjectsUseCase.invoke(user.getId);
    return projects.map(GetProjectDto.from);
  }

  @ApiOperation({ summary: "프로젝트 단건 조회" })
  @ApiParam({ name: "projectId", type: String })
  @ApiResponse({ type: GetProjectDto })
  @Get(":projectId")
  public async getOne(
    @Param("projectId", ParseProjectIdPipe) projectId: ProjectId,
  ): Promise<GetProjectDto> {
    const project = await this.getProjectUseCase.invoke(projectId);
    return GetProjectDto.from(project);
  }

  @ApiOperation({ summary: "프로젝트 수정" })
  @ApiParam({ name: "projectId", type: String })
  @Patch(":projectId")
  public async update(
    @Param("projectId", ParseProjectIdPipe) projectId: ProjectId,
    @Body() dto: UpdateProjectDto,
  ): Promise<void> {
    await this.updateProjectUseCase.invoke(
      projectId,
      dto.name,
      dto.description ?? null,
    );
  }

  @ApiOperation({ summary: "프로젝트 삭제" })
  @ApiParam({ name: "projectId", type: String })
  @Delete(":projectId")
  public async delete(
    @Param("projectId", ParseProjectIdPipe) projectId: ProjectId,
  ): Promise<void> {
    await this.deleteProjectUseCase.invoke(projectId);
  }

  @ApiOperation({ summary: "프로젝트 멤버 추가" })
  @ApiParam({ name: "projectId", type: String })
  @Post(":projectId/members")
  public async addMember(
    @Param("projectId", ParseProjectIdPipe) projectId: ProjectId,
    @Body() dto: AddProjectMemberDto,
  ): Promise<void> {
    await this.addProjectMemberUseCase.invoke(
      projectId,
      UserId.fromString(dto.userId),
      dto.role,
    );
  }

  @ApiOperation({ summary: "프로젝트 멤버 제거" })
  @ApiParam({ name: "projectId", type: String })
  @ApiParam({ name: "userId", type: String })
  @Delete(":projectId/members/:userId")
  public async removeMember(
    @Param("projectId", ParseProjectIdPipe) projectId: ProjectId,
    @Param("userId") userId: string,
  ): Promise<void> {
    await this.removeProjectMemberUseCase.invoke(
      projectId,
      UserId.fromString(userId),
    );
  }

  @ApiOperation({ summary: "프로젝트 멤버 역할 변경" })
  @ApiParam({ name: "projectId", type: String })
  @ApiParam({ name: "userId", type: String })
  @Patch(":projectId/members/:userId/role")
  public async updateMemberRole(
    @Param("projectId", ParseProjectIdPipe) projectId: ProjectId,
    @Param("userId") userId: string,
    @Body() dto: UpdateProjectMemberRoleDto,
  ): Promise<void> {
    await this.updateProjectMemberRoleUseCase.invoke(
      projectId,
      UserId.fromString(userId),
      dto.role,
    );
  }

  @ApiOperation({ summary: "프로젝트 워크플로우 수정" })
  @ApiParam({ name: "projectId", type: String })
  @Put(":projectId/workflow")
  public async updateWorkflow(
    @Param("projectId", ParseProjectIdPipe) projectId: ProjectId,
    @Body() dto: UpdateProjectWorkflowDto,
  ): Promise<void> {
    await this.updateProjectWorkflowUseCase.invoke(projectId, {
      statuses: dto.statuses,
      transitions: dto.transitions,
    });
  }

  @ApiOperation({ summary: "프로젝트 이슈 유형 수정" })
  @ApiParam({ name: "projectId", type: String })
  @Put(":projectId/issue-types")
  public async updateIssueTypes(
    @Param("projectId", ParseProjectIdPipe) projectId: ProjectId,
    @Body() dto: UpdateProjectIssueTypesDto,
  ): Promise<void> {
    await this.updateProjectIssueTypesUseCase.invoke(projectId, dto.issueTypes);
  }

  @ApiOperation({ summary: "프로젝트 우선순위 수정" })
  @ApiParam({ name: "projectId", type: String })
  @Put(":projectId/priorities")
  public async updatePriorities(
    @Param("projectId", ParseProjectIdPipe) projectId: ProjectId,
    @Body() dto: UpdateProjectPrioritiesDto,
  ): Promise<void> {
    await this.updateProjectPrioritiesUseCase.invoke(projectId, dto.priorities);
  }
}
