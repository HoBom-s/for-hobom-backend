import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { PassportModule } from "@nestjs/passport";
import { JwtAuthAdapter } from "../../infra/adapters/jwt/jwt-auth.adapter";
import { AuthEntity } from "./domain/entity/auth.entity";
import { AuthSchema } from "./domain/entity/auth.schema";
import { AuthController } from "./adapters/in/rest/auth.controller";
import { AuthPersistenceAdapter } from "./adapters/out/persistence/auth-persistence.adapter";
import { AuthQueryAdapter } from "./adapters/out/query/auth-query.adapter";
import { LoginAuthService } from "./application/use-cases/login-auth.service";
import { UserModule } from "../user/user.module";
import { RefreshTokenAuthService } from "./application/use-cases/refresh-token-auth.service";
import { JwtStrategy } from "../../shared/adpaters/in/rest/strategy/jwt.strategy";
import { AuthRepositoryImpl } from "./infra/repositories/auth.repository.impl";
import { DIToken } from "../../shared/di/token.di";

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("HOBOM_JWT_SECRET"),
        signOptions: {
          expiresIn: configService.get<string>("HOBOM_JWT_SIGN_EXPIRED_AT"),
        },
      }),
    }),
    PassportModule.register({
      defaultStrategy: "jwt",
    }),
    MongooseModule.forFeature([
      {
        name: AuthEntity.name,
        schema: AuthSchema,
      },
    ]),
    UserModule,
  ],
  providers: [
    JwtStrategy,
    {
      provide: DIToken.AuthModule.JwtAuthPort,
      useClass: JwtAuthAdapter,
    },
    {
      provide: DIToken.AuthModule.AuthRepository,
      useClass: AuthRepositoryImpl,
    },
    {
      provide: DIToken.AuthModule.AuthPersistencePort,
      useClass: AuthPersistenceAdapter,
    },
    {
      provide: DIToken.AuthModule.AuthQueryPort,
      useClass: AuthQueryAdapter,
    },
    {
      provide: DIToken.AuthModule.LoginAuthUseCase,
      useClass: LoginAuthService,
    },
    {
      provide: DIToken.AuthModule.RefreshAuthTokenUseCase,
      useClass: RefreshTokenAuthService,
    },
  ],
  controllers: [AuthController],
  exports: [
    JwtModule,
    MongooseModule,
    DIToken.AuthModule.JwtAuthPort,
    DIToken.AuthModule.AuthRepository,
    DIToken.AuthModule.AuthPersistencePort,
    DIToken.AuthModule.AuthQueryPort,
    DIToken.AuthModule.LoginAuthUseCase,
    DIToken.AuthModule.RefreshAuthTokenUseCase,
  ],
})
export class AuthModule {}
