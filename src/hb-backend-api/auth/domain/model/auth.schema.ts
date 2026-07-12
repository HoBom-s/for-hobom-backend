import { SchemaFactory } from "@nestjs/mongoose";
import { AuthEntity } from "./auth.entity";

export const AuthSchema = SchemaFactory.createForClass(AuthEntity);

AuthSchema.index({ refreshToken: 1 });
AuthSchema.index({ nickname: 1 });

export type AuthDocument = AuthEntity & Document;
