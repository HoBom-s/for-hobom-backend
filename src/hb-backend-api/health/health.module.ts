import { Module } from "@nestjs/common";
import { HealthController } from "./adapters/in/health.controller";

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
