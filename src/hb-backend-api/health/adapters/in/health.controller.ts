import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
} from "@nestjs/terminus";

@ApiTags("Health Check")
@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly mongoose: MongooseHealthIndicator,
  ) {}

  @ApiOperation({ summary: "Liveness probe" })
  @Get("live")
  public live() {
    return "OK";
  }

  @ApiOperation({ summary: "Readiness probe (DB 포함)" })
  @HealthCheck()
  @Get("ready")
  public ready() {
    return this.health.check([() => this.mongoose.pingCheck("mongodb")]);
  }
}
