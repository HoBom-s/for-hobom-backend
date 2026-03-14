import { ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AdminGuard } from "src/shared/adapters/in/rest/guard/admin.guard";
import { DIToken } from "src/shared/di/token.di";
import { UserEntitySchema } from "src/hb-backend-api/user/domain/model/user.entity";
import { UserId } from "src/hb-backend-api/user/domain/model/user-id.vo";
import { Types } from "mongoose";

describe("AdminGuard", () => {
  let guard: AdminGuard;
  const mockFindByNickname = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        AdminGuard,
        {
          provide: DIToken.UserModule.UserQueryPort,
          useValue: { findByNickname: mockFindByNickname },
        },
      ],
    }).compile();

    guard = module.get(AdminGuard);
  });

  function createContext(user?: { sub?: string | null }) {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as any;
  }

  it("should throw UnauthorizedException when user is undefined", async () => {
    await expect(guard.canActivate(createContext())).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it("should throw UnauthorizedException when user.sub is null", async () => {
    await expect(
      guard.canActivate(createContext({ sub: null })),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("should throw ForbiddenException for non-admin user", async () => {
    const userId = new UserId(new Types.ObjectId());
    mockFindByNickname.mockResolvedValue(
      UserEntitySchema.of(
        userId,
        "user",
        "u@e.com",
        "nick",
        "pw",
        [],
        undefined,
        false,
      ),
    );

    await expect(
      guard.canActivate(createContext({ sub: "nick" })),
    ).rejects.toThrow(ForbiddenException);
  });

  it("should return true for admin user", async () => {
    const userId = new UserId(new Types.ObjectId());
    mockFindByNickname.mockResolvedValue(
      UserEntitySchema.of(
        userId,
        "admin",
        "a@e.com",
        "admin",
        "pw",
        [],
        undefined,
        true,
      ),
    );

    const result = await guard.canActivate(createContext({ sub: "admin" }));
    expect(result).toBe(true);
  });
});
