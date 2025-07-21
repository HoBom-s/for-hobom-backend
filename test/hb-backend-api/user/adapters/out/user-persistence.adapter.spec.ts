import { UserRepository } from "../../../../../src/hb-backend-api/user/domain/model/user.repository";
import { UserPersistenceAdapter } from "../../../../../src/hb-backend-api/user/adapters/out/user-persistence.adapter";
import { createMockUserRepository } from "../../../../mocks/user.repository.mock";
import { UserCreateEntitySchema } from "../../../../../src/hb-backend-api/user/domain/model/user.entity";

describe("UserPersistenceAdapter", () => {
  let userRepository: jest.Mocked<UserRepository>;
  let userPersistenceAdapter: UserPersistenceAdapter;

  beforeEach(() => {
    userRepository = createMockUserRepository();
    userPersistenceAdapter = new UserPersistenceAdapter(userRepository);
  });

  describe("save()", () => {
    it("should call userRepository.save with the given user", async () => {
      const user = new UserCreateEntitySchema(
        "Robin Yeon",
        "Robin",
        "Hashed password",
        [],
      );

      await userPersistenceAdapter.save(user);

      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith(user);
    });
  });
});
