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
import { CreateBoardUseCase } from "../../ports/in/create-board.use-case";
import { GetBoardUseCase } from "../../ports/in/get-board.use-case";
import { GetBoardsByProjectUseCase } from "../../ports/in/get-boards-by-project.use-case";
import { UpdateBoardUseCase } from "../../ports/in/update-board.use-case";
import { DeleteBoardUseCase } from "../../ports/in/delete-board.use-case";
import { CreateBoardDto } from "./create-board.dto";
import { UpdateBoardDto } from "./update-board.dto";
import { GetBoardDto } from "./get-board.dto";
import { ParseBoardIdPipe } from "./parse-board-id.pipe";
import { BoardId } from "../../domain/model/board-id.vo";
import { ProjectId } from "../../../project/domain/model/project-id.vo";

@ApiTags("Boards")
@Controller(`${EndPointPrefixConstant}/projects/:projectId/boards`)
@UseGuards(JwtAuthGuard)
export class BoardController {
  constructor(
    @Inject(DIToken.UserModule.GetUserByNicknameUseCase)
    private readonly getUserByNicknameUseCase: GetUserByNicknameUseCase,
    @Inject(DIToken.BoardModule.CreateBoardUseCase)
    private readonly createBoardUseCase: CreateBoardUseCase,
    @Inject(DIToken.BoardModule.GetBoardUseCase)
    private readonly getBoardUseCase: GetBoardUseCase,
    @Inject(DIToken.BoardModule.GetBoardsByProjectUseCase)
    private readonly getBoardsByProjectUseCase: GetBoardsByProjectUseCase,
    @Inject(DIToken.BoardModule.UpdateBoardUseCase)
    private readonly updateBoardUseCase: UpdateBoardUseCase,
    @Inject(DIToken.BoardModule.DeleteBoardUseCase)
    private readonly deleteBoardUseCase: DeleteBoardUseCase,
  ) {}

  @ApiOperation({ summary: "보드 생성" })
  @ApiParam({ name: "projectId", type: String })
  @Post("")
  public async create(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Param("projectId") projectId: string,
    @Body() body: CreateBoardDto,
  ): Promise<void> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );
    await this.createBoardUseCase.invoke(
      ProjectId.fromString(projectId),
      body.name,
      body.type,
      user.getId,
    );
  }

  @ApiOperation({ summary: "프로젝트 보드 전체 조회" })
  @ApiParam({ name: "projectId", type: String })
  @ApiResponse({ type: [GetBoardDto] })
  @Get("")
  public async getAll(
    @Param("projectId") projectId: string,
  ): Promise<GetBoardDto[]> {
    const boards = await this.getBoardsByProjectUseCase.invoke(
      ProjectId.fromString(projectId),
    );
    return boards.map(GetBoardDto.from);
  }

  @ApiOperation({ summary: "보드 단건 조회" })
  @ApiParam({ name: "projectId", type: String })
  @ApiParam({ name: "boardId", type: String })
  @ApiResponse({ type: GetBoardDto })
  @Get(":boardId")
  public async getOne(
    @Param("boardId", ParseBoardIdPipe) boardId: BoardId,
  ): Promise<GetBoardDto> {
    const board = await this.getBoardUseCase.invoke(boardId);
    return GetBoardDto.from(board);
  }

  @ApiOperation({ summary: "보드 수정" })
  @ApiParam({ name: "projectId", type: String })
  @ApiParam({ name: "boardId", type: String })
  @Patch(":boardId")
  public async update(
    @Param("boardId", ParseBoardIdPipe) boardId: BoardId,
    @Body() body: UpdateBoardDto,
  ): Promise<void> {
    const data: Record<string, unknown> = {};
    if (body.name != null) data.name = body.name;
    if (body.columns != null) data.columns = body.columns;
    await this.updateBoardUseCase.invoke(boardId, data);
  }

  @ApiOperation({ summary: "보드 삭제" })
  @ApiParam({ name: "projectId", type: String })
  @ApiParam({ name: "boardId", type: String })
  @Delete(":boardId")
  public async delete(
    @Param("boardId", ParseBoardIdPipe) boardId: BoardId,
  ): Promise<void> {
    await this.deleteBoardUseCase.invoke(boardId);
  }
}
