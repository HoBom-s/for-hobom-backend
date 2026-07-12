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
import { CreateProjectLabelUseCase } from "../../ports/in/create-project-label.use-case";
import { GetProjectLabelsUseCase } from "../../ports/in/get-project-labels.use-case";
import { UpdateProjectLabelUseCase } from "../../ports/in/update-project-label.use-case";
import { DeleteProjectLabelUseCase } from "../../ports/in/delete-project-label.use-case";
import { CreateProjectLabelDto } from "./create-project-label.dto";
import { UpdateProjectLabelDto } from "./update-project-label.dto";
import { GetProjectLabelDto } from "./get-project-label.dto";
import { ParseProjectIdPipe } from "../../../project/adapters/in/parse-project-id.pipe";
import { ParseProjectLabelIdPipe } from "./parse-project-label-id.pipe";
import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { ProjectLabelId } from "../../domain/model/project-label-id.vo";

@ApiTags("Project Labels")
@Controller(`${EndPointPrefixConstant}/projects/:projectId/labels`)
@UseGuards(JwtAuthGuard)
export class ProjectLabelController {
  constructor(
    @Inject(DIToken.ProjectLabelModule.CreateProjectLabelUseCase)
    private readonly createProjectLabelUseCase: CreateProjectLabelUseCase,
    @Inject(DIToken.ProjectLabelModule.GetProjectLabelsUseCase)
    private readonly getProjectLabelsUseCase: GetProjectLabelsUseCase,
    @Inject(DIToken.ProjectLabelModule.UpdateProjectLabelUseCase)
    private readonly updateProjectLabelUseCase: UpdateProjectLabelUseCase,
    @Inject(DIToken.ProjectLabelModule.DeleteProjectLabelUseCase)
    private readonly deleteProjectLabelUseCase: DeleteProjectLabelUseCase,
  ) {}

  @ApiOperation({ summary: "프로젝트 라벨 생성" })
  @ApiParam({ name: "projectId", type: String })
  @Post("")
  public async create(
    @Param("projectId", ParseProjectIdPipe) projectId: ProjectId,
    @Body() body: CreateProjectLabelDto,
  ): Promise<void> {
    await this.createProjectLabelUseCase.invoke(
      projectId,
      body.name,
      body.color,
    );
  }

  @ApiOperation({ summary: "프로젝트 라벨 목록 조회" })
  @ApiParam({ name: "projectId", type: String })
  @ApiResponse({ type: [GetProjectLabelDto] })
  @Get("")
  public async getAll(
    @Param("projectId", ParseProjectIdPipe) projectId: ProjectId,
  ): Promise<GetProjectLabelDto[]> {
    const labels = await this.getProjectLabelsUseCase.invoke(projectId);
    return labels.map(GetProjectLabelDto.from);
  }

  @ApiOperation({ summary: "프로젝트 라벨 수정" })
  @ApiParam({ name: "projectId", type: String })
  @ApiParam({ name: "labelId", type: String })
  @Patch(":labelId")
  public async update(
    @Param("labelId", ParseProjectLabelIdPipe) labelId: ProjectLabelId,
    @Body() body: UpdateProjectLabelDto,
  ): Promise<void> {
    await this.updateProjectLabelUseCase.invoke(labelId, body.name, body.color);
  }

  @ApiOperation({ summary: "프로젝트 라벨 삭제" })
  @ApiParam({ name: "projectId", type: String })
  @ApiParam({ name: "labelId", type: String })
  @Delete(":labelId")
  public async delete(
    @Param("labelId", ParseProjectLabelIdPipe) labelId: ProjectLabelId,
  ): Promise<void> {
    await this.deleteProjectLabelUseCase.invoke(labelId);
  }
}
