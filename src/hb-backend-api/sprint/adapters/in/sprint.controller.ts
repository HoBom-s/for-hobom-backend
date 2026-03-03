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
import { EndPointPrefixConstant } from "../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../shared/di/token.di";
import { JwtAuthGuard } from "../../../../shared/adapters/in/rest/guard/jwt-auth.guard";
import {
  NicknameAndAccessToken,
  TokenUserInformation,
} from "../../../../shared/adapters/in/rest/decorator/access-token.decorator";
import { GetUserByNicknameUseCase } from "../../../user/domain/ports/in/get-user-by-nickname.use-case";
import { UserNickname } from "../../../user/domain/model/user-nickname.vo";
import { CreateSprintUseCase } from "../../ports/in/create-sprint.use-case";
import { GetSprintUseCase } from "../../ports/in/get-sprint.use-case";
import { GetSprintsByProjectUseCase } from "../../ports/in/get-sprints-by-project.use-case";
import { UpdateSprintUseCase } from "../../ports/in/update-sprint.use-case";
import { DeleteSprintUseCase } from "../../ports/in/delete-sprint.use-case";
import { StartSprintUseCase } from "../../ports/in/start-sprint.use-case";
import { CompleteSprintUseCase } from "../../ports/in/complete-sprint.use-case";
import { CreateSprintDto } from "./create-sprint.dto";
import { UpdateSprintDto } from "./update-sprint.dto";
import { GetSprintDto } from "./get-sprint.dto";
import { ParseSprintIdPipe } from "./parse-sprint-id.pipe";
import { SprintId } from "../../domain/model/sprint-id.vo";
import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { ParseProjectIdPipe } from "../../../project/adapters/in/parse-project-id.pipe";

@ApiTags("Sprints")
@Controller(`${EndPointPrefixConstant}/projects/:projectId/sprints`)
@UseGuards(JwtAuthGuard)
export class SprintController {
  constructor(
    @Inject(DIToken.UserModule.GetUserByNicknameUseCase)
    private readonly getUserByNicknameUseCase: GetUserByNicknameUseCase,
    @Inject(DIToken.SprintModule.CreateSprintUseCase)
    private readonly createSprintUseCase: CreateSprintUseCase,
    @Inject(DIToken.SprintModule.GetSprintUseCase)
    private readonly getSprintUseCase: GetSprintUseCase,
    @Inject(DIToken.SprintModule.GetSprintsByProjectUseCase)
    private readonly getSprintsByProjectUseCase: GetSprintsByProjectUseCase,
    @Inject(DIToken.SprintModule.UpdateSprintUseCase)
    private readonly updateSprintUseCase: UpdateSprintUseCase,
    @Inject(DIToken.SprintModule.DeleteSprintUseCase)
    private readonly deleteSprintUseCase: DeleteSprintUseCase,
    @Inject(DIToken.SprintModule.StartSprintUseCase)
    private readonly startSprintUseCase: StartSprintUseCase,
    @Inject(DIToken.SprintModule.CompleteSprintUseCase)
    private readonly completeSprintUseCase: CompleteSprintUseCase,
  ) {}

  @ApiOperation({ summary: "스프린트 생성" })
  @ApiParam({ name: "projectId", type: String })
  @Post("")
  public async create(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Param("projectId", ParseProjectIdPipe) projectId: ProjectId,
    @Body() dto: CreateSprintDto,
  ): Promise<void> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );
    await this.createSprintUseCase.invoke(
      projectId,
      dto.name,
      dto.goal ?? null,
      new Date(dto.startDate),
      new Date(dto.endDate),
      user.getId,
    );
  }

  @ApiOperation({ summary: "프로젝트별 스프린트 목록 조회" })
  @ApiParam({ name: "projectId", type: String })
  @ApiResponse({ type: [GetSprintDto] })
  @Get("")
  public async getByProject(
    @Param("projectId", ParseProjectIdPipe) projectId: ProjectId,
  ): Promise<GetSprintDto[]> {
    const sprints = await this.getSprintsByProjectUseCase.invoke(projectId);
    return sprints.map(GetSprintDto.from);
  }

  @ApiOperation({ summary: "스프린트 단건 조회" })
  @ApiParam({ name: "projectId", type: String })
  @ApiParam({ name: "sprintId", type: String })
  @ApiResponse({ type: GetSprintDto })
  @Get(":sprintId")
  public async getOne(
    @Param("sprintId", ParseSprintIdPipe) sprintId: SprintId,
  ): Promise<GetSprintDto> {
    const sprint = await this.getSprintUseCase.invoke(sprintId);
    return GetSprintDto.from(sprint);
  }

  @ApiOperation({ summary: "스프린트 수정" })
  @ApiParam({ name: "projectId", type: String })
  @ApiParam({ name: "sprintId", type: String })
  @Patch(":sprintId")
  public async update(
    @Param("sprintId", ParseSprintIdPipe) sprintId: SprintId,
    @Body() dto: UpdateSprintDto,
  ): Promise<void> {
    await this.updateSprintUseCase.invoke(
      sprintId,
      dto.name,
      dto.goal ?? null,
      new Date(dto.startDate),
      new Date(dto.endDate),
    );
  }

  @ApiOperation({ summary: "스프린트 삭제" })
  @ApiParam({ name: "projectId", type: String })
  @ApiParam({ name: "sprintId", type: String })
  @Delete(":sprintId")
  public async delete(
    @Param("sprintId", ParseSprintIdPipe) sprintId: SprintId,
  ): Promise<void> {
    await this.deleteSprintUseCase.invoke(sprintId);
  }

  @ApiOperation({ summary: "스프린트 시작" })
  @ApiParam({ name: "projectId", type: String })
  @ApiParam({ name: "sprintId", type: String })
  @Post(":sprintId/start")
  public async start(
    @Param("sprintId", ParseSprintIdPipe) sprintId: SprintId,
  ): Promise<void> {
    await this.startSprintUseCase.invoke(sprintId);
  }

  @ApiOperation({ summary: "스프린트 완료" })
  @ApiParam({ name: "projectId", type: String })
  @ApiParam({ name: "sprintId", type: String })
  @Post(":sprintId/complete")
  public async complete(
    @Param("sprintId", ParseSprintIdPipe) sprintId: SprintId,
  ): Promise<void> {
    await this.completeSprintUseCase.invoke(sprintId);
  }
}
