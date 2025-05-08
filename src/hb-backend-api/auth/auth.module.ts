import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { PassportModule } from "@nestjs/passport";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthAdapter } from "../../infra/adapters/jwt/jwt-auth.adapter";
import { AuthEntity } from "./domain/entity/auth.entity";
import { AuthSchema } from "./domain/entity/auth.schema";
import { AuthController } from "./adapters/in/rest/auth.controller";
import { AuthPersistenceAdapter } from "./adapters/out/persistence/auth-persistence.adapter";
import { AuthQueryAdapter } from "./adapters/out/query/auth-query.adapter";
import { LoginAuthService } from "./application/use-cases/login-auth.service";
import { UserModule } from "../user/user.module";
import { RefreshTokenAuthService } from "./application/use-cases/refresh-token-auth.service";
import { JwtAuthGuard } from "../../shared/adpaters/in/rest/guard/jwt-auth.guard";
import { JwtStrategy } from "../../shared/adpaters/in/rest/strategy/jwt.strategy";

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
    JwtAuthGuard,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: "JwtAuthPort",
      useClass: JwtAuthAdapter,
    },
    {
      provide: "AuthPersistencePort",
      useClass: AuthPersistenceAdapter,
    },
    {
      provide: "AuthQueryPort",
      useClass: AuthQueryAdapter,
    },
    {
      provide: "LoginAuthUseCase",
      useClass: LoginAuthService,
    },
    {
      provide: "RefreshAuthTokenUseCase",
      useClass: RefreshTokenAuthService,
    },
  ],
  controllers: [AuthController],
  exports: [
    JwtModule,
    MongooseModule,
    "JwtAuthPort",
    "AuthPersistencePort",
    "AuthQueryPort",
    "LoginAuthUseCase",
    "RefreshAuthTokenUseCase",
  ],
})
export class AuthModule {}
