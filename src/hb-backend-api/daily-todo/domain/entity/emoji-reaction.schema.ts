import { SchemaFactory } from "@nestjs/mongoose";
import { EmojiReactionEntity } from "./emoji-reaction.entity";

export const EmojiReactionSchema =
  SchemaFactory.createForClass(EmojiReactionEntity);
