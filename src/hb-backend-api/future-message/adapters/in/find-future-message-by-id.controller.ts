import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Controller, Get, Inject, Param, UseGuards } from "@nestjs/common";
import { EndPointPrefixConstant } from "../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../shared/di/token.di";
import { FindFutureMessageByIdUseCase } from "../../domain/ports/in/find-future-message-by-id.use-case";
import { JwtAuthGuard } from "../../../../shared/adapters/in/rest/guard/jwt-auth.guard";
import { ParseFutureMessageIdPipe } from "./future-message-id.pipe";
import { FutureMessageId } from "../../domain/model/future-message-id.vo";
import { FindFutureMessageDto } from "./find-future-message.dto";

@ApiTags("FutureMessages")
@Controller(`${EndPointPrefixConstant}/future-messages`)
export class FindFutureMessageByIdController {
  constructor(
    @Inject(DIToken.FutureMessageModule.FindFutureMessageByIdUseCase)
    private readonly findFutureMessageByIdUseCase: FindFutureMessageByIdUseCase,
  ) {}

  @ApiOperation({
    summary: "미래 메시지 단건 조회",
    description: "미래 메시지 단건 조회",
  })
  @UseGuards(JwtAuthGuard)
  @Get(":id")
  public async findById(
    @Param("id", ParseFutureMessageIdPipe) id: FutureMessageId,
  ): Promise<FindFutureMessageDto> {
    const response = await this.findFutureMessageByIdUseCase.invoke(id);

    return FindFutureMessageDto.from(response);
  }
}
