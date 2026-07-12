import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AdminGuard } from "src/shared/adapters/in/rest/guard/admin.guard";
import { DIToken } from "src/shared/di/token.di";

describe("AdminGuard", () => {
  let guard: AdminGuard;

  const mockUserQueryPort = {
    findByNickname: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        AdminGuard,
        {
          provide: DIToken.UserModule.UserQueryPort,
          useValue: mockUserQueryPort,
        },
      ],
    }).compile();

    guard = module.get(AdminGuard);
  });

  const createContext = (user?: { sub?: string | null }) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as unknown as ExecutionContext;

  it("user undefined -> UnauthorizedException", async () => {
    await expect(guard.canActivate(createContext())).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it("user.sub null -> UnauthorizedException", async () => {
    await expect(
      guard.canActivate(createContext({ sub: null })),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("isAdmin false -> ForbiddenException", async () => {
    mockUserQueryPort.findByNickname.mockResolvedValue({
      get getIsAdmin() {
        return false;
      },
    });

    await expect(
      guard.canActivate(createContext({ sub: "nick" })),
    ).rejects.toThrow(ForbiddenException);
  });

  it("isAdmin true -> true", async () => {
    mockUserQueryPort.findByNickname.mockResolvedValue({
      get getIsAdmin() {
        return true;
      },
    });

    const result = await guard.canActivate(createContext({ sub: "admin" }));

    expect(result).toBe(true);
  });
});
