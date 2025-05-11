import { UserRepository } from "../../src/hb-backend-api/user/domain/repositories/user.repository";

export function createMockUserRepository(): jest.Mocked<UserRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    findByNickname: jest.fn(),
  };
}
