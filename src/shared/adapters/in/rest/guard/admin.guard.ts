import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { DIToken } from "../../../../di/token.di";
import { UserQueryPort } from "../../../../../hb-backend-api/user/domain/ports/out/user-query.port";
import { UserNickname } from "../../../../../hb-backend-api/user/domain/model/user-nickname.vo";
import { JwtAuthPayloadModel } from "../../../../../hb-backend-api/auth/domain/model/jwt-auth-payload.model";

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @Inject(DIToken.UserModule.UserQueryPort)
    private readonly userQueryPort: UserQueryPort,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtAuthPayloadModel | undefined;

    if (user?.sub == null) {
      throw new UnauthorizedException("인증이 필요해요.");
    }

    const foundUser = await this.userQueryPort.findByNickname(
      UserNickname.fromString(user.sub),
    );

    if (!foundUser.getIsAdmin) {
      throw new ForbiddenException("관리자 권한이 필요해요.");
    }

    return true;
  }
}
