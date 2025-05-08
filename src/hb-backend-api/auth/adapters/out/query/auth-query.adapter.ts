import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuthQueryPort } from "../../../application/ports/out/auth-query.port";
import {
  AuthEntity,
  AuthEntitySchema,
} from "../../../domain/entity/auth.entity";
import { AuthDocument } from "../../../domain/entity/auth.schema";

@Injectable()
export class AuthQueryAdapter implements AuthQueryPort {
  constructor(
    @InjectModel(AuthEntity.name)
    private readonly authModel: Model<AuthDocument>,
  ) {}

  public async findByRefreshToken(token: string): Promise<AuthEntitySchema> {
    const foundAuth = await this.authModel
      .findOne({
        refreshToken: token,
      })
      .lean()
      .exec();
    if (foundAuth == null) {
      throw new NotFoundException("사용자의 토큰을 찾을 수 없어요.");
    }

    const { nickname, refreshToken, expiresAt } = foundAuth;

    return new AuthEntitySchema(nickname, refreshToken, expiresAt);
  }
}
