import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from "@nestjs/common";
import { AddNoteMemberUseCase } from "../../domain/ports/in/add-note-member.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { NotePersistencePort } from "../../domain/ports/out/note-persistence.port";
import { NoteQueryPort } from "../../domain/ports/out/note-query.port";
import { NoteId } from "../../domain/model/note-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";

@Injectable()
export class AddNoteMemberService implements AddNoteMemberUseCase {
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
      throw new ForbiddenException("노트 소유자만 멤버를 추가할 수 있어요.");
    }

    if (note.getOwner.equals(memberUserId)) {
      throw new BadRequestException("소유자를 멤버로 추가할 수 없어요.");
    }

    if (note.isMember(memberUserId)) {
      throw new BadRequestException("이미 멤버로 추가된 사용자에요.");
    }

    await this.notePersistencePort.addMember(note.getId, memberUserId);
  }
}
