import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable, tap } from "rxjs";
import { Response } from "express";

@Injectable()
export class CookiesInterceptor implements NestInterceptor {
  private ACCESS_TOKEN = "accessToken";
  private REFRESH_TOKEN = "refreshToken";
  private ACCESS_TOKEN_EXPIRATION = 24 * 60 * 60 * 1000;
  private REFRESH_TOKEN_EXPIRATION = 30 * 24 * 60 * 60 * 1000;

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      tap((data) => {
        const response = context.switchToHttp().getResponse<Response>();

        if (data.accessToken == null || data.refreshToken == null) {
          throw new Error("검증할 토큰이 존재하지 않아요.");
        }

        response.cookie(this.ACCESS_TOKEN, data.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: this.ACCESS_TOKEN_EXPIRATION,
        });

        response.cookie(this.REFRESH_TOKEN, data.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: this.REFRESH_TOKEN_EXPIRATION,
        });
      }),
    );
  }
}
