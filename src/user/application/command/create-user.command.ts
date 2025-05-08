export class CreateUserCommand {
  constructor(
    private readonly username: string,
    private readonly nickname: string,
    private readonly password: string,
  ) {
    this.username = username;
    this.nickname = nickname;
    this.password = password;
  }

  public static of(
    username: string,
    nickname: string,
    password: string,
  ): CreateUserCommand {
    return new CreateUserCommand(username, nickname, password);
  }

  get getUsername(): string {
    return this.username;
  }

  get getNickname(): string {
    return this.nickname;
  }

  get getPassword(): string {
    return this.password;
  }
}
