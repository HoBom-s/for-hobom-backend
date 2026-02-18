export class CreateUserCommand {
  constructor(
    private readonly username: string,
    private readonly nickname: string,
    private readonly email: string,
    private readonly password: string,
  ) {
    this.username = username;
    this.nickname = nickname;
    this.email = email;
    this.password = password;
  }

  public static of(
    username: string,
    nickname: string,
    email: string,
    password: string,
  ): CreateUserCommand {
    return new CreateUserCommand(username, nickname, email, password);
  }

  get getUsername(): string {
    return this.username;
  }

  get getNickname(): string {
    return this.nickname;
  }

  get getEmail(): string {
    return this.email;
  }

  get getPassword(): string {
    return this.password;
  }
}
