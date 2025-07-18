import { Prop, Schema } from "@nestjs/mongoose";
import { BaseEntity } from "../../../../shared/base/base.entity";

@Schema({ collection: "auth" })
export class AuthEntity extends BaseEntity {
  @Prop({ required: true, index: true })
  nickname: string;

  @Prop({ required: true })
  refreshToken: string;

  @Prop({ type: Date, default: null })
  expiresAt: Date;
}

export class AuthEntitySchema {
  constructor(
    private readonly nickname: string,
    private readonly refreshToken: string,
    private readonly expiredAt: Date,
  ) {
    this.nickname = nickname;
    this.refreshToken = refreshToken;
    this.expiredAt = expiredAt;
  }

  public static of(
    nickname: string,
    refreshToken: string,
    expiredAt: Date,
  ): AuthEntitySchema {
    return new AuthEntitySchema(nickname, refreshToken, expiredAt);
  }

  get getNickname(): string {
    return this.nickname;
  }

  get getRefreshToken(): string {
    return this.refreshToken;
  }

  get getExpiredAt(): Date {
    return this.expiredAt;
  }
}
