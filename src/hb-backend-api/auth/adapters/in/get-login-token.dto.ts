import { LoginAuthResult } from "../../domain/ports/out/login-auth.result";
import { ApiProperty } from "@nestjs/swagger";

export class GetLoginTokenDto {
  @ApiProperty({ type: "string" })
  accessToken: string;

  @ApiProperty({ type: "string" })
  refreshToken: string;

  constructor(accessToken: string, refreshToken: string) {
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
