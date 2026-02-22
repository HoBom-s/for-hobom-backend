import { Inject, Injectable } from "@nestjs/common";
import { NotePersistencePort } from "../../domain/ports/out/note-persistence.port";
import { DIToken } from "../../../../shared/di/token.di";
import { NoteRepository } from "../../domain/model/note.repository";
import { NoteCreateEntitySchema } from "../../domain/model/note.entity";
import { NoteId } from "../../domain/model/note-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { NoteStatus } from "../../domain/enums/note-status.enum";

@Injectable()
export class NotePersistenceAdapter implements NotePersistencePort {
  constructor(
    @Inject(DIToken.NoteModule.NoteRepository)
    private readonly noteRepository: NoteRepository,
  ) {}

  public async save(schema: NoteCreateEntitySchema): Promise<void> {
    await this.noteRepository.save(schema);
  }

  public async update(
    id: NoteId,
    owner: UserId,
    data: Record<string, unknown>,
  ): Promise<void> {
    await this.noteRepository.update(id, owner, data);
  }

  public async updateStatus(
    id: NoteId,
    owner: UserId,
    status: NoteStatus,
    trashedAt: Date | null,
  ): Promise<void> {
    await this.noteRepository.update(id, owner, { status, trashedAt });
  }

  public async togglePin(
    id: NoteId,
    owner: UserId,
    isPinned: boolean,
  ): Promise<void> {
    await this.noteRepository.update(id, owner, { isPinned });
  }

  public async updateOrder(
    id: NoteId,
    owner: UserId,
    order: number,
  ): Promise<void> {
    await this.noteRepository.update(id, owner, { order });
  }

  public async deleteOne(id: NoteId, owner: UserId): Promise<void> {
    await this.noteRepository.deleteOne(id, owner);
  }

  public async emptyTrash(owner: UserId): Promise<void> {
    await this.noteRepository.deleteAllTrashed(owner);
  }
}
