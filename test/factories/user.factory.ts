import { UserDocument } from "../../src/hb-backend-api/user/domain/entity/user.schema";

export function createMockUser(
  overrides: Partial<UserDocument> = {},
): UserDocument {
  return {
    _id: "681c1ebc9481a8b5148f5155",
    username: "Robin Yeon",
    nickname: "Robin",
    password: "Hashed password",
    friends: [],
    ...overrides,
  } as UserDocument;
}
