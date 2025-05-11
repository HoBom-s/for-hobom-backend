import { AuthRepository } from "../../../../../../src/hb-backend-api/auth/domain/repositories/auth.repository";
import { AuthPersistenceAdapter } from "../../../../../../src/hb-backend-api/auth/adapters/out/persistence/auth-persistence.adapter";
import { createMockAuthRepository } from "../../../../../mocks/auth.repository.mock";
import { AuthEntitySchema } from "../../../../../../src/hb-backend-api/auth/domain/entity/auth.entity";
import { UserNickname } from "../../../../../../src/hb-backend-api/user/domain/vo/user-nickname.vo";
import { RefreshToken } from "../../../../../../src/hb-backend-api/auth/domain/vo/refresh-token.vo";

describe("AuthPersistenceAdapter", () => {
  let authRepository: jest.Mocked<AuthRepository>;
  let authPersistenceAdapter: AuthPersistenceAdapter;

  beforeEach(() => {
    authRepository = createMockAuthRepository();
    authPersistenceAdapter = new AuthPersistenceAdapter(authRepository);
  });

  describe("saveRefreshToken()", () => {
    it("should call authRepository.save with the given auth information", async () => {
      const auth = new AuthEntitySchema("Robin", "Refreshed Token", new Date());

      await authPersistenceAdapter.saveRefreshToken(auth);

      expect(authRepository.save).toHaveBeenCalledTimes(1);
      expect(authRepository.save).toHaveBeenCalledWith(auth);
    });
  });

  describe("updateRefreshToken()", () => {
    it("should call authRepository.updateRefreshToken, with the given nickname, newRefreshToken", async () => {
      const userNickname = UserNickname.fromString("Robin");
      const refreshToken = RefreshToken.fromString(
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidHlwIjoiUmVmcmVzaFRva2VuIiwiaWF0IjoxNjg4ODg4ODg4LCJleHAiOjE2ODg5NzUyODh9.dGhpcy1pcy1ub3QtYS1yZWFsLXNpZ25hdHVyZQ",
      );
      await authPersistenceAdapter.updateRefreshToken(
        userNickname,
        refreshToken,
      );

      expect(authRepository.updateRefreshToken).toHaveBeenCalledTimes(1);
      expect(authRepository.updateRefreshToken).toHaveBeenCalledWith(
        userNickname,
        refreshToken,
      );
    });
  });
});
