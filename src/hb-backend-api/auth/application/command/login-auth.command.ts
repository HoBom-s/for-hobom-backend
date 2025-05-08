export class LoginAuthCommand {
  constructor(
    private readonly nickname: string,
    private readonly password: string,
  ) {
    this.nickname = nickname;
    this.password = password;
  }

  public static of(nickname: string, password: string): LoginAuthCommand {
    return new LoginAuthCommand(nickname, password);
  }

  get getNickname(): string {
    return this.nickname;
  }

  get getPassword(): string {
    return this.password;
  }
}
