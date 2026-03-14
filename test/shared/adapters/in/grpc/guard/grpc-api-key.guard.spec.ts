import { UnauthorizedException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { GrpcApiKeyGuard } from "src/shared/adapters/in/grpc/guard/grpc-api-key.guard";

describe("GrpcApiKeyGuard", () => {
  let guard: GrpcApiKeyGuard;
  const EXPECTED_KEY = "correct-api-key-12345";

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GrpcApiKeyGuard,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue(EXPECTED_KEY),
          },
        },
      ],
    }).compile();

    guard = module.get(GrpcApiKeyGuard);
  });

  function createContext(apiKey?: string) {
    return {
      switchToRpc: () => ({
        getContext: () => ({
          get: (key: string) => {
            if (key === "x-api-key") {
              return apiKey !== undefined ? [apiKey] : [undefined];
            }
            return [];
          },
        }),
      }),
    } as any;
  }

  it("should return true when API key matches", () => {
    expect(guard.canActivate(createContext(EXPECTED_KEY))).toBe(true);
  });

  it("should throw UnauthorizedException when API key is undefined", () => {
    expect(() => guard.canActivate(createContext())).toThrow(
      UnauthorizedException,
    );
  });

  it("should throw UnauthorizedException when API key does not match", () => {
    expect(() => guard.canActivate(createContext("wrong-key-67890"))).toThrow(
      UnauthorizedException,
    );
  });

  it("should throw UnauthorizedException when API key length differs", () => {
    expect(() => guard.canActivate(createContext("short"))).toThrow(
      UnauthorizedException,
    );
  });
});
