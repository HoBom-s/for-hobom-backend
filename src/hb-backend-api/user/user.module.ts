import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserEntity } from "./domain/entity/user.entity";
import { UserSchema } from "./domain/entity/user.schema";
import { UserPersistenceAdapter } from "./adapters/out/persistence/user-persistence.adapter";
import { CreateUserService } from "./application/use-cases/create-user.service";
import { UserController } from "./adapters/in/rest/user.controller";
import { UserQueryAdapter } from "./adapters/out/query/user-query.adapter";
import { GetUserService } from "./application/use-cases/get-user.service";
import { UserRepositoryImpl } from "./infra/repositories/user.repository.impl";
import { DIToken } from "../../shared/di/token.di";

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
      provide: DIToken.UserModule.UserRepository,
      useClass: UserRepositoryImpl,
    },
    {
      provide: DIToken.UserModule.UserPersistencePort,
      useClass: UserPersistenceAdapter,
    },
    {
      provide: DIToken.UserModule.UserQueryPort,
      useClass: UserQueryAdapter,
    },
    {
      provide: DIToken.UserModule.CreateUserUseCase,
      useClass: CreateUserService,
    },
    {
      provide: DIToken.UserModule.GetUserUseCase,
      useClass: GetUserService,
    },
  ],
  exports: [
    MongooseModule,
    DIToken.UserModule.UserRepository,
    DIToken.UserModule.UserPersistencePort,
    DIToken.UserModule.UserQueryPort,
    DIToken.UserModule.CreateUserUseCase,
    DIToken.UserModule.GetUserUseCase,
  ],
})
export class UserModule {}
