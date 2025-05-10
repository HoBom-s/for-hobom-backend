import { AuthRepository } from "../../../../../../src/hb-backend-api/auth/domain/repositories/auth.repository";
import { AuthPersistenceAdapter } from "../../../../../../src/hb-backend-api/auth/adapters/out/persistence/auth-persistence.adapter";
import { createMockAuthRepository } from "../../../../../mocks/auth.repository.mock";
import { AuthEntitySchema } from "../../../../../../src/hb-backend-api/auth/domain/entity/auth.entity";

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
      await authPersistenceAdapter.updateRefreshToken("Robin", "Token");

      expect(authRepository.updateRefreshToken).toHaveBeenCalledTimes(1);
      expect(authRepository.updateRefreshToken).toHaveBeenCalledWith(
        "Robin",
        "Token",
      );
    });
  });
});
