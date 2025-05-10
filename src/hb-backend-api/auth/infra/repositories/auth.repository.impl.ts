import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuthRepository } from "../../domain/repositories/auth.repository";
import { AuthEntity, AuthEntitySchema } from "../../domain/entity/auth.entity";
import { AuthDocument } from "../../domain/entity/auth.schema";

@Injectable()
export class AuthRepositoryImpl implements AuthRepository {
  constructor(
    @InjectModel(AuthEntity.name)
    private readonly authModel: Model<AuthDocument>,
  ) {}

  public async findByRefreshToken(token: string): Promise<AuthEntity> {
    const foundAuth = await this.authModel
      .findOne({
        refreshToken: token,
      })
      .lean()
      .exec();
    if (foundAuth == null) {
      throw new NotFoundException("사용자의 토큰을 찾을 수 없어요.");
    }

    return foundAuth;
  }

  public async save(authEntitySchema: AuthEntitySchema): Promise<void> {
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
      throw new InternalServerErrorException("Token 갱신을 실패했어요.");
    }
  }

  public async revokeToken(token: string): Promise<void> {
    const foundAuth = await this.findByRefreshToken(token);
    if (foundAuth == null) {
      return;
    }

    await this.authModel.deleteOne({
      refreshToken: token,
    });
  }
}
