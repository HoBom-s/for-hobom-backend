import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { Metadata } from "@grpc/grpc-js";
import { GrpcApiKeyGuard } from "src/shared/adapters/in/grpc/guard/grpc-api-key.guard";

describe("GrpcApiKeyGuard", () => {
  let guard: GrpcApiKeyGuard;
  const EXPECTED_KEY = "valid-api-key-123";

  const mockConfigService = {
    getOrThrow: jest.fn().mockReturnValue(EXPECTED_KEY),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockConfigService.getOrThrow.mockReturnValue(EXPECTED_KEY);

    const module = await Test.createTestingModule({
      providers: [
        GrpcApiKeyGuard,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    guard = module.get(GrpcApiKeyGuard);
  });

  const createContext = (apiKey?: string) => {
    const metadata = new Metadata();
    if (apiKey) {
      metadata.add("x-api-key", apiKey);
    }
    return {
      switchToRpc: () => ({
        getContext: () => metadata,
      }),
    } as unknown as ExecutionContext;
  };

  it("API key matches -> true", () => {
    expect(guard.canActivate(createContext(EXPECTED_KEY))).toBe(true);
  });

  it("API key undefined (empty metadata) -> UnauthorizedException", () => {
    expect(() => guard.canActivate(createContext())).toThrow(
      UnauthorizedException,
    );
  });

  it("API key length differs -> UnauthorizedException", () => {
    expect(() => guard.canActivate(createContext("short"))).toThrow(
      UnauthorizedException,
    );
  });

  it("API key same length but wrong value -> UnauthorizedException", () => {
    const wrongKey = "x".repeat(EXPECTED_KEY.length);

    expect(() => guard.canActivate(createContext(wrongKey))).toThrow(
      UnauthorizedException,
    );
  });
});
