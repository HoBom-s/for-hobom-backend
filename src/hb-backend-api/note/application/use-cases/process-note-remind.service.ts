import { Inject, Injectable } from "@nestjs/common";
import { from, lastValueFrom } from "rxjs";
import { concatMap } from "rxjs/operators";
import { ProcessNoteRemindUseCase } from "../../domain/ports/in/process-note-remind.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { NoteQueryPort } from "../../domain/ports/out/note-query.port";
import { NoteEntitySchema } from "../../domain/model/note.entity";
import { NoteStatus } from "../../domain/enums/note-status.enum";
import { NoteReminder } from "../../domain/model/note-reminder";
import { Recurrence } from "../../domain/enums/recurrence.enum";
import { UserQueryPort } from "../../../user/domain/ports/out/user-query.port";
import { UserEntitySchema } from "../../../user/domain/model/user.entity";
import { OutboxPersistencePort } from "../../../outbox/domain/ports/out/outbox-persistence.port";
import { OutboxPayloadFactoryRegistry } from "../../../outbox/domain/model/outbox-payload-factory.registry";
import { CreateOutboxEntity } from "../../../outbox/domain/model/create-outbox.entity";
import { EventType } from "../../../outbox/domain/model/event-type.enum";
import { OutboxStatus } from "../../../outbox/domain/model/outbox-status.enum";
import { MessageEnum } from "../../../outbox/domain/model/message.enum";
import { Transactional } from "../../../../infra/mongo/transaction/transaction.decorator";
import { TransactionRunner } from "../../../../infra/mongo/transaction/transaction.runner";

@Injectable()
export class ProcessNoteRemindService implements ProcessNoteRemindUseCase {
  constructor(
    @Inject(DIToken.NoteModule.NoteQueryPort)
    private readonly noteQueryPort: NoteQueryPort,
    @Inject(DIToken.UserModule.UserQueryPort)
    private readonly userQueryPort: UserQueryPort,
    @Inject(DIToken.OutboxModule.OutboxPersistencePort)
    private readonly outboxPersistencePort: OutboxPersistencePort,
    public readonly transactionRunner: TransactionRunner,
  ) {}

  @Transactional()
  public async invoke(): Promise<void> {
    const users = await this.userQueryPort.findAll();
    if (users.length === 0) return;

    const today = new Date();
    await this.processUsersSequentially(users, today);
  }

  private async processUsersSequentially(
    users: UserEntitySchema[],
    today: Date,
  ): Promise<void> {
    await lastValueFrom(
      from(users).pipe(
        concatMap((user) => from(this.processUserReminders(user, today))),
      ),
    );
  }

  private async processUserReminders(
    user: UserEntitySchema,
    today: Date,
  ): Promise<void> {
    const notes = await this.noteQueryPort.findAll(
      user.getId,
      NoteStatus.ACTIVE,
    );
    const dueNotes = this.filterDueNotes(notes, today);

    for (const note of dueNotes) {
      await this.createOutbox(note, user);
    }
  }

  private filterDueNotes(
    notes: NoteEntitySchema[],
    today: Date,
  ): NoteEntitySchema[] {
    return notes.filter((note) => {
      const reminder = note.getReminder;
      if (reminder == null) return false;
      return this.isDueToday(reminder, today);
    });
  }

  private isDueToday(reminder: NoteReminder, today: Date): boolean {
    const reminderDate = reminder.getDate;

    switch (reminder.getRecurrence) {
      case Recurrence.NONE:
        return this.isSameDate(reminderDate, today);

      case Recurrence.DAILY:
        return true;

      case Recurrence.WEEKLY:
        return reminderDate.getDay() === today.getDay();

      case Recurrence.MONTHLY:
        return reminderDate.getDate() === today.getDate();

      default:
        return false;
    }
  }

  private isSameDate(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  private async createOutbox(
    note: NoteEntitySchema,
    user: UserEntitySchema,
  ): Promise<void> {
    const payload = OutboxPayloadFactoryRegistry.MESSAGE({
      id: note.getId.toString(),
      title: note.getTitle ?? "Note Reminder",
      body: note.getContent ?? "",
      recipient: user.getNickname,
      senderId: user.getId.toString(),
      type: MessageEnum.PUSH_MESSAGE,
    });

    const outboxEntity = CreateOutboxEntity.of(
      EventType.MESSAGE,
      payload,
      OutboxStatus.PENDING,
      1,
      1,
    );

    await this.outboxPersistencePort.save(outboxEntity);
  }
}
