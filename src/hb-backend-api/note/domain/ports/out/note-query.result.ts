import { NoteId } from "../../model/note-id.vo";
import { UserId } from "../../../../user/domain/model/user-id.vo";
import { LabelId } from "../../../../label/domain/model/label-id.vo";
import { NoteType } from "../../enums/note-type.enum";
import { NoteStatus } from "../../enums/note-status.enum";
import { NoteColor } from "../../model/note-color.vo";
import { ChecklistItem } from "../../model/checklist-item";
import { NoteReminder } from "../../model/note-reminder";
import { NoteEntitySchema } from "../../model/note.entity";

export class NoteQueryResult {
  constructor(
    private readonly id: NoteId,
    private readonly owner: UserId,
    private readonly title: string | null,
    private readonly content: string | null,
    private readonly type: NoteType,
    private readonly checklistItems: ChecklistItem[],
    private readonly color: NoteColor,
    private readonly isPinned: boolean,
    private readonly status: NoteStatus,
    private readonly trashedAt: Date | null,
    private readonly labels: LabelId[],
    private readonly reminder: NoteReminder | null,
    private readonly order: number,
  ) {}

  public static from(entity: NoteEntitySchema): NoteQueryResult {
    return new NoteQueryResult(
      entity.getId,
      entity.getOwner,
      entity.getTitle,
      entity.getContent,
      entity.getType,
      entity.getChecklistItems,
      entity.getColor,
      entity.getIsPinned,
      entity.getStatus,
      entity.getTrashedAt,
      entity.getLabels,
      entity.getReminder,
      entity.getOrder,
    );
  }

  get getId(): NoteId {
    return this.id;
  }
  get getOwner(): UserId {
    return this.owner;
  }
  get getTitle(): string | null {
    return this.title;
  }
  get getContent(): string | null {
    return this.content;
  }
  get getType(): NoteType {
    return this.type;
  }
  get getChecklistItems(): ChecklistItem[] {
    return this.checklistItems;
  }
  get getColor(): NoteColor {
    return this.color;
  }
  get getIsPinned(): boolean {
    return this.isPinned;
  }
  get getStatus(): NoteStatus {
    return this.status;
  }
  get getTrashedAt(): Date | null {
    return this.trashedAt;
  }
  get getLabels(): LabelId[] {
    return this.labels;
  }
  get getReminder(): NoteReminder | null {
    return this.reminder;
  }
  get getOrder(): number {
    return this.order;
  }
}
