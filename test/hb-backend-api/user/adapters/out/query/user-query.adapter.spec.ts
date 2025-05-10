import { NotFoundException } from "@nestjs/common";
import { UserQueryAdapter } from "../../../../../../src/hb-backend-api/user/adapters/out/query/user-query.adapter";
import { UserEntitySchema } from "../../../../../../src/hb-backend-api/user/domain/entity/user.entity";
import { UserRepository } from "../../../../../../src/hb-backend-api/user/domain/repositories/user.repository";
import { createMockUser } from "../../../../../factories/user.factory";
import { createMockUserRepository } from "../../../../../mocks/user.repository.mock";

describe("UserQueryAdapter", () => {
  let userRepository: jest.Mocked<UserRepository>;
  let userQueryAdapter: UserQueryAdapter;

  beforeEach(() => {
    userRepository = createMockUserRepository();
    userQueryAdapter = new UserQueryAdapter(userRepository);
  });

  describe("findById()", () => {
    it("should return a UserEntitySchema when user id found by userId", async () => {
      const foundUser = createMockUser();

      userRepository.findById.mockResolvedValue(foundUser);

      const result = await userQueryAdapter.findById("id-123");

      expect(userRepository.findById).toHaveBeenCalledWith("id-123");
      expect(result).toBeInstanceOf(UserEntitySchema);
      expect(result).toMatchObject({
        username: "Robin Yeon",
        nickname: "Robin",
        password: "Hashed password",
        friends: [],
      });
    });

    it("should throw NotFoundException when user is not found", async () => {
      userRepository.findById.mockResolvedValue(null as any);

      await expect(userQueryAdapter.findById("not-found-id")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("findByNickname()", () => {
    it("should return a UserEntitySchema when user is found by nickname", async () => {
      const foundUser = createMockUser();

      userRepository.findByNickname.mockResolvedValue(foundUser);

      const result = await userQueryAdapter.findByNickname("Robin");

      expect(userRepository.findByNickname).toHaveBeenCalledWith("Robin");
      expect(result).toBeInstanceOf(UserEntitySchema);
      expect(result).toMatchObject({
        username: "Robin Yeon",
        nickname: "Robin",
        password: "Hashed password",
        friends: [],
      });
    });

    it("should throw NotFoundException when user is not found", async () => {
      userRepository.findByNickname.mockResolvedValue(null as any);

      await expect(
        userQueryAdapter.findByNickname("not-found-nickname"),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
