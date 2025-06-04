import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserEntity } from "./domain/entity/user.entity";
import { UserSchema } from "./domain/entity/user.schema";
import { UserPersistenceAdapter } from "./adapters/out/persistence/user-persistence.adapter";
import { CreateUserService } from "./application/use-cases/create-user.service";
import { CreateUserController } from "./adapters/in/rest/create-user.controller";
import { UserQueryAdapter } from "./adapters/out/query/user-query.adapter";
import { GetUserService } from "./application/use-cases/get-user.service";
import { UserRepositoryImpl } from "./infra/repositories/user.repository.impl";
import { DIToken } from "../../shared/di/token.di";
import { GetUserByNicknameService } from "./application/use-cases/get-user-by-nickname.service";
import { GetUserByIdController } from "./adapters/in/rest/get-user-by-id.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: UserEntity.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [CreateUserController, GetUserByIdController],
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
    {
      provide: DIToken.UserModule.GetUserByNicknameUseCase,
      useClass: GetUserByNicknameService,
    },
  ],
  exports: [
    MongooseModule,
    DIToken.UserModule.UserRepository,
    DIToken.UserModule.UserPersistencePort,
    DIToken.UserModule.UserQueryPort,
    DIToken.UserModule.CreateUserUseCase,
    DIToken.UserModule.GetUserUseCase,
    DIToken.UserModule.GetUserByNicknameUseCase,
  ],
})
export class UserModule {}
