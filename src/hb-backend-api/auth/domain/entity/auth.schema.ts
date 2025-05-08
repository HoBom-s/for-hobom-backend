import { SchemaFactory } from "@nestjs/mongoose";
import { AuthEntity } from "./auth.entity";

export const AuthSchema = SchemaFactory.createForClass(AuthEntity);

export type AuthDocument = AuthEntity & Document;
