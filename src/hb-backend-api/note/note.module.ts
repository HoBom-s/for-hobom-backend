import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { NoteEntity } from "./domain/model/note.entity";
import { NoteSchema } from "./domain/model/note.schema";
import { DIToken } from "../../shared/di/token.di";
import { UserModule } from "../user/user.module";
import { OutboxModule } from "../outbox/outbox.module";
import { ProcessNoteRemindService } from "./application/use-cases/process-note-remind.service";
import { NoteRepositoryImpl } from "./infra/repositories/note.repository.impl";
import { NotePersistenceAdapter } from "./adapters/out/note-persistence.adapter";
import { NoteQueryAdapter } from "./adapters/out/note-query.adapter";
import { NoteController } from "./adapters/in/note.controller";
import { CreateNoteService } from "./application/use-cases/create-note.service";
import { GetAllNotesService } from "./application/use-cases/get-all-notes.service";
import { GetNoteByIdService } from "./application/use-cases/get-note-by-id.service";
import { UpdateNoteService } from "./application/use-cases/update-note.service";
import { UpdateNoteStatusService } from "./application/use-cases/update-note-status.service";
import { ToggleNotePinService } from "./application/use-cases/toggle-note-pin.service";
import { ReorderNoteService } from "./application/use-cases/reorder-note.service";
import { DeleteNoteService } from "./application/use-cases/delete-note.service";
import { EmptyTrashService } from "./application/use-cases/empty-trash.service";
import { ProcessNoteRemindScheduler } from "./adapters/in/process-note-remind.scheduler";
import { ProcessNoteDestroyScheduler } from "./adapters/in/process-note-destroy.scheduler";
import { ProcessNoteDestroyService } from "./application/use-cases/process-note-destroy.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: NoteEntity.name,
        schema: NoteSchema,
      },
    ]),
    UserModule,
    OutboxModule,
  ],
  controllers: [NoteController],
  providers: [
    ProcessNoteRemindScheduler,
    ProcessNoteDestroyScheduler,
    {
      provide: DIToken.NoteModule.NoteRepository,
      useClass: NoteRepositoryImpl,
    },
    {
      provide: DIToken.NoteModule.NotePersistencePort,
      useClass: NotePersistenceAdapter,
    },
    {
      provide: DIToken.NoteModule.NoteQueryPort,
      useClass: NoteQueryAdapter,
    },
    {
      provide: DIToken.NoteModule.CreateNoteUseCase,
      useClass: CreateNoteService,
    },
    {
      provide: DIToken.NoteModule.GetAllNotesUseCase,
      useClass: GetAllNotesService,
    },
    {
      provide: DIToken.NoteModule.GetNoteByIdUseCase,
      useClass: GetNoteByIdService,
    },
    {
      provide: DIToken.NoteModule.UpdateNoteUseCase,
      useClass: UpdateNoteService,
    },
    {
      provide: DIToken.NoteModule.UpdateNoteStatusUseCase,
      useClass: UpdateNoteStatusService,
    },
    {
      provide: DIToken.NoteModule.ToggleNotePinUseCase,
      useClass: ToggleNotePinService,
    },
    {
      provide: DIToken.NoteModule.ReorderNoteUseCase,
      useClass: ReorderNoteService,
    },
    {
      provide: DIToken.NoteModule.DeleteNoteUseCase,
      useClass: DeleteNoteService,
    },
    {
      provide: DIToken.NoteModule.EmptyTrashUseCase,
      useClass: EmptyTrashService,
    },
    {
      provide: DIToken.NoteModule.ProcessNoteRemindUseCase,
      useClass: ProcessNoteRemindService,
    },
    {
      provide: DIToken.NoteModule.ProcessNoteDestroyUseCase,
      useClass: ProcessNoteDestroyService,
    },
  ],
})
export class NoteModule {}
