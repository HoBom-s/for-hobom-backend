import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { RoutineEntity } from "./domian/entity/routine.entity";
import { RoutineSchema } from "./domian/entity/routine.schema";
import { UserModule } from "../user/user.module";
import { CategoryModule } from "../category/category.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: RoutineEntity.name,
        schema: RoutineSchema,
      },
    ]),
    UserModule,
    CategoryModule,
  ],
  exports: [MongooseModule],
})
export class RoutineModule {}
