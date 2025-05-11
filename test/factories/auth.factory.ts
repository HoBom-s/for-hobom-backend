import { AuthEntity } from "../../src/hb-backend-api/auth/domain/entity/auth.entity";

export function createMockAuth(
  overrides: Partial<AuthEntity> = {},
): AuthEntity {
  return {
    nickname: "Robin",
    refreshToken:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidHlwIjoiUmVmcmVzaFRva2VuIiwiaWF0IjoxNjg4ODg4ODg4LCJleHAiOjE2ODg5NzUyODh9.dGhpcy1pcy1ub3QtYS1yZWFsLXNpZ25hdHVyZQ",
    ...overrides,
  } as AuthEntity;
}
