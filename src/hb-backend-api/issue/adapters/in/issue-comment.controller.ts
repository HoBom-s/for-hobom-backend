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
import { CreateIssueCommentUseCase } from "../../ports/in/create-issue-comment.use-case";
import { UpdateIssueCommentUseCase } from "../../ports/in/update-issue-comment.use-case";
import { DeleteIssueCommentUseCase } from "../../ports/in/delete-issue-comment.use-case";
import { GetIssueCommentsUseCase } from "../../ports/in/get-issue-comments.use-case";
import { CreateIssueCommentDto } from "./dto/create-issue-comment.dto";
import { UpdateIssueCommentDto } from "./dto/update-issue-comment.dto";
import { GetIssueCommentDto } from "./dto/get-issue-comment.dto";
import { ParseIssueIdPipe } from "./parse-issue-id.pipe";
import { ParseIssueCommentIdPipe } from "./parse-issue-comment-id.pipe";
import { IssueId } from "../../domain/model/issue-id.vo";
import { IssueCommentId } from "../../domain/model/issue-comment-id.vo";
import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { ParseProjectIdPipe } from "../../../project/adapters/in/parse-project-id.pipe";

@ApiTags("Issue Comments")
@Controller(
  `${EndPointPrefixConstant}/projects/:projectId/issues/:issueId/comments`,
)
@UseGuards(JwtAuthGuard)
export class IssueCommentController {
  constructor(
    @Inject(DIToken.UserModule.GetUserByNicknameUseCase)
    private readonly getUserByNicknameUseCase: GetUserByNicknameUseCase,
    @Inject(DIToken.IssueModule.CreateIssueCommentUseCase)
    private readonly createIssueCommentUseCase: CreateIssueCommentUseCase,
    @Inject(DIToken.IssueModule.UpdateIssueCommentUseCase)
    private readonly updateIssueCommentUseCase: UpdateIssueCommentUseCase,
    @Inject(DIToken.IssueModule.DeleteIssueCommentUseCase)
    private readonly deleteIssueCommentUseCase: DeleteIssueCommentUseCase,
    @Inject(DIToken.IssueModule.GetIssueCommentsUseCase)
    private readonly getIssueCommentsUseCase: GetIssueCommentsUseCase,
  ) {}

  @ApiOperation({ summary: "이슈 댓글 생성" })
  @ApiParam({ name: "projectId", type: String })
  @ApiParam({ name: "issueId", type: String })
  @Post("")
  public async create(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Param("projectId", ParseProjectIdPipe) projectId: ProjectId,
    @Param("issueId", ParseIssueIdPipe) issueId: IssueId,
    @Body() dto: CreateIssueCommentDto,
  ): Promise<void> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );
    await this.createIssueCommentUseCase.invoke(
      issueId,
      projectId,
      user.getId,
      dto.body,
    );
  }

  @ApiOperation({ summary: "이슈 댓글 목록 조회" })
  @ApiParam({ name: "projectId", type: String })
  @ApiParam({ name: "issueId", type: String })
  @ApiResponse({ type: [GetIssueCommentDto] })
  @Get("")
  public async getAll(
    @Param("issueId", ParseIssueIdPipe) issueId: IssueId,
  ): Promise<GetIssueCommentDto[]> {
    const comments = await this.getIssueCommentsUseCase.invoke(issueId);
    return comments.map(GetIssueCommentDto.from);
  }

  @ApiOperation({ summary: "이슈 댓글 수정" })
  @ApiParam({ name: "projectId", type: String })
  @ApiParam({ name: "issueId", type: String })
  @ApiParam({ name: "commentId", type: String })
  @Patch(":commentId")
  public async update(
    @Param("commentId", ParseIssueCommentIdPipe) commentId: IssueCommentId,
    @Body() dto: UpdateIssueCommentDto,
  ): Promise<void> {
    await this.updateIssueCommentUseCase.invoke(commentId, dto.body);
  }

  @ApiOperation({ summary: "이슈 댓글 삭제" })
  @ApiParam({ name: "projectId", type: String })
  @ApiParam({ name: "issueId", type: String })
  @ApiParam({ name: "commentId", type: String })
  @Delete(":commentId")
  public async delete(
    @Param("commentId", ParseIssueCommentIdPipe) commentId: IssueCommentId,
  ): Promise<void> {
    await this.deleteIssueCommentUseCase.invoke(commentId);
  }
}
