import { AuthRepository } from "../../../../../../src/hb-backend-api/auth/domain/repositories/auth.repository";
import { AuthQueryAdapter } from "../../../../../../src/hb-backend-api/auth/adapters/out/query/auth-query.adapter";
import { createMockAuthRepository } from "../../../../../mocks/auth.repository.mock";
import { createMockAuth } from "../../../../../factories/auth.factory";
import { AuthEntitySchema } from "../../../../../../src/hb-backend-api/auth/domain/entity/auth.entity";

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

      const result = await authQueryAdapter.findByRefreshToken("Token");

      expect(authRepository.findByRefreshToken).toHaveBeenCalledWith("Token");
      expect(result).toBeInstanceOf(AuthEntitySchema);
      expect(result).toMatchObject({
        nickname: "Robin",
        refreshToken: "Token",
      });
    });
  });
});
