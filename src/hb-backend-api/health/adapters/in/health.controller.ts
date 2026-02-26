import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("Health Check")
@Controller()
export class HealthController {
  @ApiOperation({ summary: "헬스 체크", description: "헬스 체크 API" })
  @ApiResponse({ type: String })
  @Get("")
  public ok() {
    return "OK";
  }
}
