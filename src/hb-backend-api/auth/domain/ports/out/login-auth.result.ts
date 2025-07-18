export class LoginAuthResult {
  constructor(
    private readonly accessToken: string,
    private readonly refreshToken: string,
  ) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  public static of(accessToken: string, refreshToken: string): LoginAuthResult {
    return new LoginAuthResult(accessToken, refreshToken);
  }

  get getAccessToken(): string {
    return this.accessToken;
  }

  get getRefreshToken(): string {
    return this.refreshToken;
  }
}
