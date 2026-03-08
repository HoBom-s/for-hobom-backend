import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from "@nestjs/common";
import { RemoveNoteMemberUseCase } from "../../domain/ports/in/remove-note-member.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { NotePersistencePort } from "../../domain/ports/out/note-persistence.port";
import { NoteQueryPort } from "../../domain/ports/out/note-query.port";
import { NoteId } from "../../domain/model/note-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";

@Injectable()
export class RemoveNoteMemberService implements RemoveNoteMemberUseCase {
  constructor(
    @Inject(DIToken.NoteModule.NotePersistencePort)
    private readonly notePersistencePort: NotePersistencePort,
    @Inject(DIToken.NoteModule.NoteQueryPort)
    private readonly noteQueryPort: NoteQueryPort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(
    noteId: NoteId,
    userId: UserId,
    memberUserId: UserId,
  ): Promise<void> {
    const note = await this.noteQueryPort.findById(noteId, userId);

    if (!note.isOwner(userId)) {
      throw new ForbiddenException("노트 소유자만 멤버를 제거할 수 있어요.");
    }

    if (!note.isMember(memberUserId)) {
      throw new BadRequestException("해당 사용자는 멤버가 아니에요.");
    }

    await this.notePersistencePort.removeMember(note.getId, memberUserId);
  }
}
