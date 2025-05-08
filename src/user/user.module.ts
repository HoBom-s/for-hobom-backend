import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserEntity } from "./domain/entity/user.entity";
import { UserSchema } from "./domain/entity/user.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: UserEntity.name,
        schema: UserSchema,
      },
    ]),
  ],
  exports: [MongooseModule],
})
export class UserModule {}
