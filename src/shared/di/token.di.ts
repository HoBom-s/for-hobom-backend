import { DITokenRegister } from "./token-registry.di";

export class DIToken {
  public static AuthModule = class extends DITokenRegister {
    public static AuthRepository = this.register("AuthRepository");

    public static JwtAuthPort = this.register("JwtAuthPort");

    public static AuthPersistencePort = this.register("AuthPersistencePort");
    public static AuthQueryPort = this.register("AuthQueryPort");

    public static LoginAuthUseCase = this.register("LoginAuthUseCase");
    public static RefreshAuthTokenUseCase = this.register(
      "RefreshAuthTokenUseCase",
    );
  };

  public static readonly UserModule = class extends DITokenRegister {
    public static UserRepository = this.register("UserRepository");

    public static UserPersistencePort = this.register("UserPersistencePort");
    public static UserQueryPort = this.register("UserQueryPort");

    public static CreateUserUseCase = this.register("CreateUserUseCase");
    public static GetUserUseCase = this.register("GetUserUseCase");
  };
}
