import { LoginAuthResult } from "../../../application/result/login-auth.result";

export class GetLoginTokenDto {
  constructor(
    private readonly accessToken: string,
    private readonly refreshToken: string,
  ) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  public static from(loginAuthResult: LoginAuthResult): GetLoginTokenDto {
    return new GetLoginTokenDto(
      loginAuthResult.getAccessToken,
      loginAuthResult.getRefreshToken,
    );
  }
}
