export class UserNickname {
  constructor(private readonly value: string) {
    Object.freeze(this);
  }

  public static fromString(nickname: string): UserNickname {
    if (nickname == null || nickname.trim().length === 0) {
      throw new Error("닉네임이 정의되지 않았어요.");
    }

    if (nickname.length < 3 || nickname.length > 20) {
      throw new Error("닉네임은 3자 이상 20자 이하이어야 해요.");
    }

    return new UserNickname(nickname);
  }

  public get raw(): string {
    return this.value;
  }
}
