export class RefreshToken {
  constructor(private readonly value: string) {
    if (!this.isValid(value)) {
      throw new Error("유효하지 않은 토큰이에요.");
    }
  }

  public static fromString(refreshToken: string): RefreshToken {
    if (refreshToken == null) {
      throw new Error("토큰이 정의되지 않았어요.");
    }

    return new RefreshToken(refreshToken);
  }

  public get raw(): string {
    return this.value;
  }

  private isValid(token: string): boolean {
    // 간단한 JWT 형식 검증 (헤더, 페이로드, 서명)
    const parts = token.split(".");

    return parts.length === 3;
  }
}
