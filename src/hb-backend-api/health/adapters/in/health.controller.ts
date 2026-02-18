import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("Health Check")
@Controller()
export class HealthController {
  @ApiOperation({ summary: "헬스 체크", description: "헬스 체크 API" })
  @Get("")
  public ok() {
    return "OK";
  }
}
