import { Prop, Schema } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class BaseEntity extends Document {
  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}
