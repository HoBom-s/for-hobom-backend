import { Controller, Get, Inject, Param, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { EndPointPrefixConstant } from "../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../shared/di/token.di";
import { JwtAuthGuard } from "../../../../shared/adapters/in/rest/guard/jwt-auth.guard";
import { GetIssueHistoryUseCase } from "../../ports/in/get-issue-history.use-case";
import { GetIssueHistoryDto } from "./dto/get-issue-history.dto";
import { ParseIssueIdPipe } from "./parse-issue-id.pipe";
import { IssueId } from "../../domain/model/issue-id.vo";

@ApiTags("Issue History")
@Controller(
  `${EndPointPrefixConstant}/projects/:projectId/issues/:issueId/history`,
)
@UseGuards(JwtAuthGuard)
export class IssueHistoryController {
  constructor(
    @Inject(DIToken.IssueModule.GetIssueHistoryUseCase)
    private readonly getIssueHistoryUseCase: GetIssueHistoryUseCase,
  ) {}

  @ApiOperation({ summary: "이슈 히스토리 조회" })
  @ApiParam({ name: "projectId", type: String })
  @ApiParam({ name: "issueId", type: String })
  @ApiResponse({ type: [GetIssueHistoryDto] })
  @Get("")
  public async getAll(
    @Param("issueId", ParseIssueIdPipe) issueId: IssueId,
  ): Promise<GetIssueHistoryDto[]> {
    const histories = await this.getIssueHistoryUseCase.invoke(issueId);
    return histories.map(GetIssueHistoryDto.from);
  }
}
