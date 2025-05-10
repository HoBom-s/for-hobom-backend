import { IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class LoginAuthDto {
  @IsNotEmpty({ message: "사용자 닉네임을 입력해 주세요." })
  @IsString({ message: "사용자 닉네임은 문자열만 가능해요." })
  nickname: string;

  @IsNotEmpty({ message: "사용자 비밀번호를 입력해 주세요." })
  @IsString({ message: "사용자 비밀번호는 문자열만 가능해요." })
  @MinLength(8, { message: "비밀번호는 최소 8자 이상이어야 해요." })
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).+$/, {
    message: "비밀번호는 대문자, 소문자, 숫자, 특수문자를 모두 포함해야 해요.",
  })
  password: string;
}
