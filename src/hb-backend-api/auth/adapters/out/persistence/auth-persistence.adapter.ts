import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  AuthEntity,
  AuthEntitySchema,
} from "src/hb-backend-api/auth/domain/entity/auth.entity";
import { AuthPersistencePort } from "../../../application/ports/out/auth-persistence.port";
import { AuthDocument } from "../../../domain/entity/auth.schema";

@Injectable()
export class AuthPersistenceAdapter implements AuthPersistencePort {
  constructor(
    @InjectModel(AuthEntity.name)
    private readonly authModel: Model<AuthDocument>,
  ) {}

  public async saveRefreshToken(
    authEntitySchema: AuthEntitySchema,
  ): Promise<void> {
    await this.authModel.create({
      nickname: authEntitySchema.getNickname,
      refreshToken: authEntitySchema.getRefreshToken,
      expiresAt: authEntitySchema.getExpiredAt,
    });
  }

  public async updateRefreshToken(
    nickname: string,
    newRefreshToken: string,
  ): Promise<void> {
    const updateResult = await this.authModel.updateOne(
      { $or: [{ userId: nickname }, { nickname: nickname }] },
      { $set: { refreshToken: newRefreshToken } },
    );

    if (updateResult.modifiedCount === 0) {
      throw new Error("Token 갱신을 실패했어요.");
    }
  }

  public async revokeToken(token: string): Promise<void> {
    const foundAuth = await this.authModel
      .findOne({
        where: {
          refreshToken: token,
        },
      })
      .lean()
      .exec();

    if (foundAuth == null) {
      return;
    }

    await this.authModel.deleteOne({
      where: {
        refreshToken: token,
      },
    });
  }
}
