import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuthRepository } from "../../domain/model/auth.repository";
import { AuthEntity, AuthEntitySchema } from "../../domain/model/auth.entity";
import { AuthDocument } from "../../domain/model/auth.schema";
import { UserNickname } from "../../../user/domain/model/user-nickname.vo";
import { RefreshToken } from "../../domain/model/refresh-token.vo";
import { MongoSessionContext } from "../../../../infra/mongo/transaction/transaction.context";

@Injectable()
export class AuthRepositoryImpl implements AuthRepository {
  constructor(
    @InjectModel(AuthEntity.name)
    private readonly authModel: Model<AuthDocument>,
  ) {}

  public async findByRefreshToken(token: RefreshToken): Promise<AuthEntity> {
    const foundAuth = await this.authModel
      .findOne({
        refreshToken: token.raw,
      })
      .lean()
      .exec();
    if (foundAuth == null) {
      throw new NotFoundException("사용자의 토큰을 찾을 수 없어요.");
    }

    return foundAuth;
  }

  public async findByNickname(
    nickname: UserNickname,
  ): Promise<AuthEntity | null> {
    const foundAuth = await this.authModel.findOne({ nickname: nickname.raw });
    if (foundAuth == null) {
      return null;
    }

    return foundAuth;
  }

  public async save(authEntitySchema: AuthEntitySchema): Promise<void> {
    const session = MongoSessionContext.getSession();
    await this.authModel.create(
      [
        {
          nickname: authEntitySchema.getNickname,
          refreshToken: authEntitySchema.getRefreshToken,
          expiresAt: authEntitySchema.getExpiredAt,
        },
      ],
      { session: session },
    );
  }

  public async updateRefreshToken(
    nickname: UserNickname,
    newRefreshToken: RefreshToken,
  ): Promise<void> {
    const session = MongoSessionContext.getSession();
    const updateResult = await this.authModel.updateOne(
      { nickname: nickname.raw },
      { $set: { refreshToken: newRefreshToken.raw } },
      { session: session },
    );

    if (updateResult.modifiedCount === 0) {
      throw new InternalServerErrorException("Token 갱신을 실패했어요.");
    }
  }

  public async revokeToken(token: RefreshToken): Promise<void> {
    const foundAuth = await this.findByRefreshToken(token);
    if (foundAuth == null) {
      return;
    }

    await this.authModel.deleteOne({
      refreshToken: token,
    });
  }
}
