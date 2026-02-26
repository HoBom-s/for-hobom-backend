import { SchemaFactory } from "@nestjs/mongoose";
import { NotificationEntity } from "./notification.entity";

export const NotificationSchema =
  SchemaFactory.createForClass(NotificationEntity);

NotificationSchema.index({ owner: 1, createdAt: -1 });

export type NotificationDocument = NotificationEntity & Document;
