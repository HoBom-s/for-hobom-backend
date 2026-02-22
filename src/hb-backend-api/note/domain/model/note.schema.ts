import { SchemaFactory } from "@nestjs/mongoose";
import { NoteEntity } from "./note.entity";

export const NoteSchema = SchemaFactory.createForClass(NoteEntity);

NoteSchema.index({ owner: 1, status: 1, isPinned: -1, order: 1 });
NoteSchema.index({ owner: 1, labels: 1, status: 1 });
NoteSchema.index({ trashedAt: 1 });

export type NoteDocument = NoteEntity & Document;
