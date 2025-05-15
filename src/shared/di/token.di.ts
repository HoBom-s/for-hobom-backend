import { DITokenRegister } from "./token-registry.di";
import { GetUserByNicknameUseCase } from "../../hb-backend-api/user/application/ports/in/get-user-by-nickname.use-case";

export class DIToken {
  public static readonly AuthModule = class extends DITokenRegister {
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
    public static GetUserByNicknameUseCase = this.register(
      "GetUserByNicknameUseCase",
    );
  };

  public static readonly CategoryModule = class extends DITokenRegister {
    public static CategoryRepository = this.register("CategoryRepository");

    public static CategoryPersistencePort = this.register(
      "CategoryPersistencePort",
    );
    public static CategoryQueryPort = this.register("CategoryQueryPort");

    public static CreateCategoryUseCase = this.register(
      "CreateCategoryUseCase",
    );
  };
}
