import { AuthRepository } from "../../src/hb-backend-api/auth/domain/repositories/auth.repository";

export function createMockAuthRepository(): jest.Mocked<AuthRepository> {
  return {
    findByRefreshToken: jest.fn(),
    save: jest.fn(),
    updateRefreshToken: jest.fn(),
    revokeToken: jest.fn(),
  };
}
