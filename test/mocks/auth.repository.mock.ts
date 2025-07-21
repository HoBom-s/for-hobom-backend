import { AuthRepository } from "../../src/hb-backend-api/auth/domain/model/auth.repository";

export function createMockAuthRepository(): jest.Mocked<AuthRepository> {
  return {
    findByRefreshToken: jest.fn(),
    findByNickname: jest.fn(),
    save: jest.fn(),
    updateRefreshToken: jest.fn(),
    revokeToken: jest.fn(),
  };
}
