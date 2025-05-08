import { IsNotEmpty, IsString } from "class-validator";

export class LoginAuthDto {
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
