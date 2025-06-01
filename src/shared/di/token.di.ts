import { DITokenRegister } from "./token-registry.di";

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
    public static GetAllCategoryUseCase = this.register(
      "GetAllCategoryUseCase",
    );
    public static GetCategoryUseCase = this.register("GetCategoryUseCase");
    public static PatchCategoryUseCase = this.register("PatchCategoryUseCase");
    public static DeleteCategoryUseCase = this.register(
      "DeleteCategoryUseCase",
    );
  };

  public static readonly DailyTodoModule = class extends DITokenRegister {
    public static DailyTodoRepository = this.register("DailyTodoRepository");

    public static DailyTodoPersistencePort = this.register(
      "DailyTodoPersistencePort",
    );
    public static DailyTodoQueryPort = this.register("DailyTodoQueryPort");

    public static CreateDailyTodoUseCase = this.register(
      "CreateDailyTodoUseCase",
    );
    public static GetAllDailyTodoUseCase = this.register(
      "GetAllDailyTodoUseCase",
    );
    public static GetDailyTodoUseCase = this.register("GetDailyTodoUseCase");
    public static UpdateDailyTodoCompleteStatusUseCase = this.register(
      "UpdateDailyTodoCompleteStatusUseCase",
    );
    public static UpdateDailyTodoCycleUseCase = this.register(
      "UpdateDailyTodoCycleUseCase",
    );
    public static UpdateDailyTodoReactionUseCase = this.register(
      "UpdateDailyTodoReactionUseCase",
    );
    public static GetDailyTodoByDateUseCase = this.register(
      "GetDailyTodoByDateUseCase",
    );
  };
}
