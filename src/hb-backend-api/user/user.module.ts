import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserEntity } from "./domain/entity/user.entity";
import { UserSchema } from "./domain/entity/user.schema";
import { UserPersistenceAdapter } from "./adapters/out/persistence/user-persistence.adapter";
import { CreateUserService } from "./application/use-cases/create-user.service";
import { UserController } from "./adapters/in/rest/user.controller";
import { UserQueryAdapter } from "./adapters/out/query/user-query.adapter";
import { GetUserService } from "./application/use-cases/get-user.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: UserEntity.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [UserController],
  providers: [
    {
      provide: "UserPersistencePort",
      useClass: UserPersistenceAdapter,
    },
    {
      provide: "UserQueryPort",
      useClass: UserQueryAdapter,
    },
    {
      provide: "CreateUserUseCase",
      useClass: CreateUserService,
    },
    {
      provide: "GetUserUseCase",
      useClass: GetUserService,
    },
  ],
  exports: [
    MongooseModule,
    "UserPersistencePort",
    "UserQueryPort",
    "CreateUserUseCase",
    "GetUserUseCase",
  ],
})
export class UserModule {}
