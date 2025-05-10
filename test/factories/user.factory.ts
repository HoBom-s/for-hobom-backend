import { UserEntity } from "../../src/hb-backend-api/user/domain/entity/user.entity";

export function createMockUser(
  overrides: Partial<UserEntity> = {},
): UserEntity {
  return {
    username: "Robin Yeon",
    nickname: "Robin",
    password: "Hashed password",
    friends: [],
    ...overrides,
  } as UserEntity;
}
