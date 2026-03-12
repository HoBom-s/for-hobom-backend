import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Metadata } from "@grpc/grpc-js";
import { timingSafeEqual } from "crypto";

@Injectable()
export class GrpcApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const metadata = context.switchToRpc().getContext<Metadata>();
    const apiKey = metadata.get("x-api-key")[0] as string | undefined;
    const expected =
      this.configService.getOrThrow<string>("HOBOM_GRPC_API_KEY");

    if (
      apiKey == null ||
      apiKey.length !== expected.length ||
      !timingSafeEqual(Buffer.from(apiKey), Buffer.from(expected))
    ) {
      throw new UnauthorizedException("Invalid gRPC API key");
    }

    return true;
  }
}
