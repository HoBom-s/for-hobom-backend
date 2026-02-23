import { UserId } from "../../../../user/domain/model/user-id.vo";
import { LabelId } from "../../../../label/domain/model/label-id.vo";
import { NoteType } from "../../enums/note-type.enum";
import { NoteColor } from "../../model/note-color.vo";
import { ChecklistItem } from "../../model/checklist-item";
import { NoteReminder } from "../../model/note-reminder";

export class CreateNoteCommand {
  constructor(
    private readonly owner: UserId,
    private readonly title: string | null,
    private readonly content: string | null,
    private readonly type: NoteType,
    private readonly checklistItems: ChecklistItem[],
    private readonly color: NoteColor,
    private readonly labels: LabelId[],
    private readonly reminder: NoteReminder | null,
  ) {}

  public static of(
    owner: UserId,
    title: string | null,
    content: string | null,
    type: NoteType,
    checklistItems: ChecklistItem[],
    color: NoteColor,
    labels: LabelId[],
    reminder: NoteReminder | null,
  ): CreateNoteCommand {
    return new CreateNoteCommand(
      owner,
      title,
      content,
      type,
      checklistItems,
      color,
      labels,
      reminder,
    );
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
  get getLabels(): LabelId[] {
    return this.labels;
  }
  get getReminder(): NoteReminder | null {
    return this.reminder;
  }
}
