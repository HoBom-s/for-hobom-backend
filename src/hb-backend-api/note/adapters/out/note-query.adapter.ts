import { Inject, Injectable } from "@nestjs/common";
import { NoteQueryPort } from "../../domain/ports/out/note-query.port";
import { DIToken } from "../../../../shared/di/token.di";
import { NoteRepository } from "../../domain/model/note.repository";
import { NoteEntitySchema } from "../../domain/model/note.entity";
import { NoteId } from "../../domain/model/note-id.vo";
import { NoteColor } from "../../domain/model/note-color.vo";
import { ChecklistItem } from "../../domain/model/checklist-item";
import { NoteReminder } from "../../domain/model/note-reminder";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { LabelId } from "../../../label/domain/model/label-id.vo";
import { NoteStatus } from "../../domain/enums/note-status.enum";
import { NoteDocument } from "../../domain/model/note.schema";
import { Recurrence } from "../../domain/enums/recurrence.enum";

@Injectable()
export class NoteQueryAdapter implements NoteQueryPort {
  constructor(
    @Inject(DIToken.NoteModule.NoteRepository)
    private readonly noteRepository: NoteRepository,
  ) {}

  public async findById(id: NoteId, owner: UserId): Promise<NoteEntitySchema> {
    const doc = await this.noteRepository.findById(id, owner);
    return this.toEntity(doc);
  }

  public async findAll(
    owner: UserId,
    status: NoteStatus,
  ): Promise<NoteEntitySchema[]> {
    const docs = await this.noteRepository.findAll(owner, status);
    if (docs.length === 0) return [];
    return docs.map((doc) => this.toEntity(doc));
  }

  public async findMinOrder(owner: UserId): Promise<number> {
    return this.noteRepository.findMinOrder(owner);
  }

  private toEntity(doc: NoteDocument): NoteEntitySchema {
    return NoteEntitySchema.of(
      NoteId.fromString(String(doc._id)),
      UserId.fromString(String(doc.owner)),
      doc.title,
      doc.content,
      doc.type,
      (doc.checklistItems ?? []).map((i) =>
        ChecklistItem.of(i.text, i.checked, i.order),
      ),
      NoteColor.fromString(doc.color),
      doc.isPinned,
      doc.status,
      doc.trashedAt,
      (doc.labels ?? []).map((l) => LabelId.fromString(String(l))),
      doc.reminder
        ? NoteReminder.of(doc.reminder.date, doc.reminder.recurrence)
        : null,
      doc.order,
    );
  }
}
