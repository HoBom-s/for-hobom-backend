import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { EndPointPrefixConstant } from "../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../shared/di/token.di";
import { JwtAuthGuard } from "../../../../shared/adapters/in/rest/guard/jwt-auth.guard";
import {
  NicknameAndAccessToken,
  TokenUserInformation,
} from "../../../../shared/adapters/in/rest/decorator/access-token.decorator";
import { GetUserByNicknameUseCase } from "../../../user/domain/ports/in/get-user-by-nickname.use-case";
import { UserNickname } from "../../../user/domain/model/user-nickname.vo";
import { CreateNoteUseCase } from "../../domain/ports/in/create-note.use-case";
import { GetAllNotesUseCase } from "../../domain/ports/in/get-all-notes.use-case";
import { GetNoteByIdUseCase } from "../../domain/ports/in/get-note-by-id.use-case";
import { UpdateNoteUseCase } from "../../domain/ports/in/update-note.use-case";
import { UpdateNoteStatusUseCase } from "../../domain/ports/in/update-note-status.use-case";
import { ToggleNotePinUseCase } from "../../domain/ports/in/toggle-note-pin.use-case";
import { ReorderNoteUseCase } from "../../domain/ports/in/reorder-note.use-case";
import { DeleteNoteUseCase } from "../../domain/ports/in/delete-note.use-case";
import { EmptyTrashUseCase } from "../../domain/ports/in/empty-trash.use-case";
import { CreateNoteDto } from "./create-note.dto";
import { UpdateNoteDto } from "./update-note.dto";
import { UpdateNoteStatusDto } from "./update-note-status.dto";
import { ReorderNoteDto } from "./reorder-note.dto";
import { ParseNoteIdPipe } from "./note-id.pipe";
import { NoteId } from "../../domain/model/note-id.vo";
import { NoteStatus } from "../../domain/enums/note-status.enum";
import { CreateNoteCommand } from "../../domain/ports/out/create-note.command";
import { UpdateNoteCommand } from "../../domain/ports/out/update-note.command";
import { NoteColor } from "../../domain/model/note-color.vo";
import { ChecklistItem } from "../../domain/model/checklist-item";
import { NoteReminder } from "../../domain/model/note-reminder";
import { LabelId } from "../../../label/domain/model/label-id.vo";
import { NoteQueryResult } from "../../domain/ports/out/note-query.result";

@ApiTags("Notes")
@Controller(`${EndPointPrefixConstant}/notes`)
@UseGuards(JwtAuthGuard)
export class NoteController {
  constructor(
    @Inject(DIToken.UserModule.GetUserByNicknameUseCase)
    private readonly getUserByNicknameUseCase: GetUserByNicknameUseCase,
    @Inject(DIToken.NoteModule.CreateNoteUseCase)
    private readonly createNoteUseCase: CreateNoteUseCase,
    @Inject(DIToken.NoteModule.GetAllNotesUseCase)
    private readonly getAllNotesUseCase: GetAllNotesUseCase,
    @Inject(DIToken.NoteModule.GetNoteByIdUseCase)
    private readonly getNoteByIdUseCase: GetNoteByIdUseCase,
    @Inject(DIToken.NoteModule.UpdateNoteUseCase)
    private readonly updateNoteUseCase: UpdateNoteUseCase,
    @Inject(DIToken.NoteModule.UpdateNoteStatusUseCase)
    private readonly updateNoteStatusUseCase: UpdateNoteStatusUseCase,
    @Inject(DIToken.NoteModule.ToggleNotePinUseCase)
    private readonly toggleNotePinUseCase: ToggleNotePinUseCase,
    @Inject(DIToken.NoteModule.ReorderNoteUseCase)
    private readonly reorderNoteUseCase: ReorderNoteUseCase,
    @Inject(DIToken.NoteModule.DeleteNoteUseCase)
    private readonly deleteNoteUseCase: DeleteNoteUseCase,
    @Inject(DIToken.NoteModule.EmptyTrashUseCase)
    private readonly emptyTrashUseCase: EmptyTrashUseCase,
  ) {}

  @ApiOperation({ summary: "노트 생성" })
  @Post("")
  public async create(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Body() body: CreateNoteDto,
  ): Promise<void> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );
    await this.createNoteUseCase.invoke(
      CreateNoteCommand.of(
        user.getId,
        body.title ?? null,
        body.content ?? null,
        body.type,
        (body.checklistItems ?? []).map((i) =>
          ChecklistItem.of(i.text, i.checked, i.order),
        ),
        NoteColor.fromString(body.color ?? null),
        (body.labels ?? []).map((l) => LabelId.fromString(l)),
        body.reminder
          ? NoteReminder.of(
              new Date(body.reminder.date),
              body.reminder.recurrence,
            )
          : null,
      ),
    );
  }

  @ApiOperation({ summary: "노트 목록 조회" })
  @ApiQuery({ name: "status", enum: NoteStatus, required: false })
  @Get("")
  public async findAll(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Query("status") status?: NoteStatus,
  ): Promise<NoteQueryResult[]> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );
    return this.getAllNotesUseCase.invoke(
      user.getId,
      status ?? NoteStatus.ACTIVE,
    );
  }

  @ApiOperation({ summary: "노트 단건 조회" })
  @Get(":id")
  public async findById(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Param("id", ParseNoteIdPipe) id: NoteId,
  ): Promise<NoteQueryResult> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );
    return this.getNoteByIdUseCase.invoke(id, user.getId);
  }

  @ApiOperation({ summary: "노트 수정" })
  @Patch(":id")
  public async update(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Param("id", ParseNoteIdPipe) id: NoteId,
    @Body() body: UpdateNoteDto,
  ): Promise<void> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );
    await this.updateNoteUseCase.invoke(
      id,
      UpdateNoteCommand.of(
        user.getId,
        body.title,
        body.content,
        body.checklistItems?.map((i) =>
          ChecklistItem.of(i.text, i.checked, i.order),
        ),
        body.color != null ? NoteColor.fromString(body.color) : undefined,
        body.labels?.map((l) => LabelId.fromString(l)),
        body.reminder !== undefined
          ? body.reminder
            ? NoteReminder.of(
                new Date(body.reminder.date),
                body.reminder.recurrence,
              )
            : null
          : undefined,
      ),
    );
  }

  @ApiOperation({ summary: "노트 상태 변경 (아카이브/휴지통/복원)" })
  @Patch(":id/status")
  public async updateStatus(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Param("id", ParseNoteIdPipe) id: NoteId,
    @Body() body: UpdateNoteStatusDto,
  ): Promise<void> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );
    await this.updateNoteStatusUseCase.invoke(id, user.getId, body.status);
  }

  @ApiOperation({ summary: "노트 핀 토글" })
  @Patch(":id/pin")
  public async togglePin(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Param("id", ParseNoteIdPipe) id: NoteId,
  ): Promise<void> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );
    await this.toggleNotePinUseCase.invoke(id, user.getId);
  }

  @ApiOperation({ summary: "노트 순서 변경" })
  @Patch(":id/order")
  public async reorder(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Param("id", ParseNoteIdPipe) id: NoteId,
    @Body() body: ReorderNoteDto,
  ): Promise<void> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );
    await this.reorderNoteUseCase.invoke(id, user.getId, body.order);
  }

  @ApiOperation({ summary: "휴지통 비우기 (휴지통 노트 전체 영구 삭제)" })
  @Delete("trash")
  public async emptyTrash(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
  ): Promise<void> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );
    await this.emptyTrashUseCase.invoke(user.getId);
  }

  @ApiOperation({ summary: "노트 영구 삭제 (휴지통에서만 가능)" })
  @Delete(":id")
  public async delete(
    @NicknameAndAccessToken() userInfo: TokenUserInformation,
    @Param("id", ParseNoteIdPipe) id: NoteId,
  ): Promise<void> {
    const user = await this.getUserByNicknameUseCase.invoke(
      UserNickname.fromString(userInfo.nickname),
    );
    await this.deleteNoteUseCase.invoke(id, user.getId);
  }
}
