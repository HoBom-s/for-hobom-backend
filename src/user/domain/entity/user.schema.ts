import { SchemaFactory } from "@nestjs/mongoose";
import { compare, genSalt, hash } from "bcrypt";
import { UserEntity } from "./user.entity";

export const UserSchema = SchemaFactory.createForClass(UserEntity);

export type UserDocument = UserEntity & Document;

UserSchema.pre<UserDocument>("save", async function (next) {
  if (!this.isModified("password")) {
    return next;
  }

  const salt = await genSalt(Number(process.env.HOBOM_GEN_SALT));
  this.password = await hash(this.password, salt);

  next();
});

UserSchema.methods.comparePassword = async function (
  password: string,
): Promise<boolean> {
  return compare(password, this.password);
};
