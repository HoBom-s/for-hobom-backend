import { SchemaFactory } from "@nestjs/mongoose";
import { genSalt, hash } from "bcrypt";
import { UserEntity } from "./user.entity";

export const UserSchema = SchemaFactory.createForClass(UserEntity);

export type UserDocument = UserEntity & Document;

UserSchema.pre<UserDocument>("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await genSalt(Number(process.env.HOBOM_GEN_SALT));
  this.password = await hash(this.password, salt);
});
