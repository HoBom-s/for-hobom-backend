import { NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";
import { UserQueryAdapter } from "../../../../../src/hb-backend-api/user/adapters/out/user-query.adapter";
import { UserEntitySchema } from "../../../../../src/hb-backend-api/user/domain/model/user.entity";
import { UserRepository } from "../../../../../src/hb-backend-api/user/domain/model/user.repository";
import { createMockUser } from "../../../../factories/user.factory";
import { createMockUserRepository } from "../../../../mocks/user.repository.mock";
import { UserId } from "../../../../../src/hb-backend-api/user/domain/model/user-id.vo";
import { UserNickname } from "../../../../../src/hb-backend-api/user/domain/model/user-nickname.vo";

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

      const userId = new UserId(new Types.ObjectId());
      const result = await userQueryAdapter.findById(userId);

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
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

      const userId = new UserId(new Types.ObjectId());
      await expect(userQueryAdapter.findById(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("findByNickname()", () => {
    it("should return a UserEntitySchema when user is found by nickname", async () => {
      const foundUser = createMockUser();

      userRepository.findByNickname.mockResolvedValue(foundUser);

      const userNickname = UserNickname.fromString("Robin");
      const result = await userQueryAdapter.findByNickname(userNickname);

      expect(userRepository.findByNickname).toHaveBeenCalledWith(userNickname);
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

      const userNickname = UserNickname.fromString("not-found-nickname");
      await expect(
        userQueryAdapter.findByNickname(userNickname),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
