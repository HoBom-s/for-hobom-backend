import { AuthEntity } from "../../src/hb-backend-api/auth/domain/entity/auth.entity";

export function createMockAuth(
  overrides: Partial<AuthEntity> = {},
): AuthEntity {
  return {
    nickname: "Robin",
    refreshToken: "Token",
    ...overrides,
  } as AuthEntity;
}
