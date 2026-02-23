import { Prop, Schema } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { BaseEntity } from "../../../../shared/base/base.entity";
import { NoteType } from "../enums/note-type.enum";
import { NoteStatus } from "../enums/note-status.enum";
import { Recurrence } from "../enums/recurrence.enum";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { LabelId } from "../../../label/domain/model/label-id.vo";
import { NoteId } from "./note-id.vo";
import { NoteColor } from "./note-color.vo";
import { ChecklistItem } from "./checklist-item";
import { NoteReminder } from "./note-reminder";

@Schema({ collection: "notes" })
export class NoteEntity extends BaseEntity {
  @Prop({ type: Types.ObjectId, ref: "user", required: true, index: true })
  owner: Types.ObjectId;

  @Prop({ type: String, default: null })
  title: string | null;

  @Prop({ type: String, default: null })
  content: string | null;

  @Prop({ type: String, enum: NoteType, default: NoteType.TEXT })
  type: NoteType;

  @Prop({
    type: [{ text: String, checked: Boolean, order: Number }],
    default: [],
  })
  checklistItems: {
    text: string;
    checked: boolean;
    order: number;
  }[];

  @Prop({ type: String, default: "#FFFFFF" })
  color: string;

  @Prop({ type: Boolean, default: false })
  isPinned: boolean;

  @Prop({ type: String, enum: NoteStatus, default: NoteStatus.ACTIVE })
  status: NoteStatus;

  @Prop({ type: Date, default: null })
  trashedAt: Date | null;

  @Prop({ type: [Types.ObjectId], ref: "labels", default: [] })
  labels: Types.ObjectId[];

  @Prop({
    type: {
      date: Date,
      recurrence: {
        type: String,
        enum: Recurrence,
      },
    },
    default: null,
  })
  reminder: {
    date: Date;
    recurrence: Recurrence;
  } | null;

  @Prop({ type: Number, default: 0 })
  order: number;
}

export class NoteEntitySchema {
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

  public static of(
    id: NoteId,
    owner: UserId,
    title: string | null,
    content: string | null,
    type: NoteType,
    checklistItems: ChecklistItem[],
    color: NoteColor,
    isPinned: boolean,
    status: NoteStatus,
    trashedAt: Date | null,
    labels: LabelId[],
    reminder: NoteReminder | null,
    order: number,
  ): NoteEntitySchema {
    return new NoteEntitySchema(
      id,
      owner,
      title,
      content,
      type,
      checklistItems,
      color,
      isPinned,
      status,
      trashedAt,
      labels,
      reminder,
      order,
    );
  }

  public isTrashed(): boolean {
    return this.status === NoteStatus.TRASHED;
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

export class NoteCreateEntitySchema {
  constructor(
    private readonly owner: UserId,
    private readonly title: string | null,
    private readonly content: string | null,
    private readonly type: NoteType,
    private readonly checklistItems: ChecklistItem[],
    private readonly color: NoteColor,
    private readonly labels: LabelId[],
    private readonly reminder: NoteReminder | null,
    private readonly order: number,
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
    order: number,
  ): NoteCreateEntitySchema {
    return new NoteCreateEntitySchema(
      owner,
      title,
      content,
      type,
      checklistItems,
      color,
      labels,
      reminder,
      order,
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
  get getOrder(): number {
    return this.order;
  }
}
