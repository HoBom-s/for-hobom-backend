import { UserId } from "../../../../user/domain/model/user-id.vo";
import { LabelId } from "../../../../label/domain/model/label-id.vo";
import { NoteColor } from "../../model/note-color.vo";
import { ChecklistItem } from "../../model/checklist-item";
import { NoteReminder } from "../../model/note-reminder";

export class UpdateNoteCommand {
  constructor(
    private readonly owner: UserId,
    private readonly title: string | null | undefined,
    private readonly content: string | null | undefined,
    private readonly checklistItems: ChecklistItem[] | undefined,
    private readonly color: NoteColor | undefined,
    private readonly labels: LabelId[] | undefined,
    private readonly reminder: NoteReminder | null | undefined,
  ) {}

  public static of(
    owner: UserId,
    title?: string | null,
    content?: string | null,
    checklistItems?: ChecklistItem[],
    color?: NoteColor,
    labels?: LabelId[],
    reminder?: NoteReminder | null,
  ): UpdateNoteCommand {
    return new UpdateNoteCommand(
      owner,
      title,
      content,
      checklistItems,
      color,
      labels,
      reminder,
    );
  }

  get getOwner(): UserId {
    return this.owner;
  }
  get getTitle(): string | null | undefined {
    return this.title;
  }
  get getContent(): string | null | undefined {
    return this.content;
  }
  get getChecklistItems(): ChecklistItem[] | undefined {
    return this.checklistItems;
  }
  get getColor(): NoteColor | undefined {
    return this.color;
  }
  get getLabels(): LabelId[] | undefined {
    return this.labels;
  }
  get getReminder(): NoteReminder | null | undefined {
    return this.reminder;
  }
}
