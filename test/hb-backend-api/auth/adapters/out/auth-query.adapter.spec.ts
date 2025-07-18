import { AuthRepository } from "../../../../../src/hb-backend-api/auth/domain/model/auth.repository";
import { AuthQueryAdapter } from "../../../../../src/hb-backend-api/auth/adapters/out/auth-query.adapter";
import { createMockAuthRepository } from "../../../../mocks/auth.repository.mock";
import { createMockAuth } from "../../../../factories/auth.factory";
import { AuthEntitySchema } from "../../../../../src/hb-backend-api/auth/domain/model/auth.entity";
import { RefreshToken } from "../../../../../src/hb-backend-api/auth/domain/model/refresh-token.vo";

describe("AuthQueryAdapter", () => {
  let authRepository: jest.Mocked<AuthRepository>;
  let authQueryAdapter: AuthQueryAdapter;

  beforeEach(() => {
    authRepository = createMockAuthRepository();
    authQueryAdapter = new AuthQueryAdapter(authRepository);
  });

  describe("findByRefreshToken()", () => {
    it("should return a AuthEntitySchema when auth is found by refreshToken", async () => {
      const foundAuth = createMockAuth();

      authRepository.findByRefreshToken.mockResolvedValue(foundAuth);

      const refreshToken = RefreshToken.fromString(
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidHlwIjoiUmVmcmVzaFRva2VuIiwiaWF0IjoxNjg4ODg4ODg4LCJleHAiOjE2ODg5NzUyODh9.dGhpcy1pcy1ub3QtYS1yZWFsLXNpZ25hdHVyZQ",
      );
      const result = await authQueryAdapter.findByRefreshToken(refreshToken);

      expect(authRepository.findByRefreshToken).toHaveBeenCalledWith(
        refreshToken,
      );
      expect(result).toBeInstanceOf(AuthEntitySchema);
      expect(result).toMatchObject({
        nickname: foundAuth.nickname,
        refreshToken: foundAuth.refreshToken,
      });
    });
  });
});
