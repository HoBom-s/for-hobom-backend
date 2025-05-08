import { Prop, Schema } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { BaseEntity } from "../../../shared/base/base.entity";

@Schema({ collection: "user" })
export class UserEntity extends BaseEntity {
  @Prop({ type: String, required: true })
  username: string;

  @Prop({ type: String, required: true, unique: true })
  nickname: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: [Types.ObjectId], ref: "user", default: [] })
  friends: Types.ObjectId[];
}
