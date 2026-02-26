import { Controller, Inject, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { EndPointPrefixConstant } from "../../../../shared/constants/end-point-prefix.constant";
import { DIToken } from "../../../../shared/di/token.di";
import { ProcessNoteRemindUseCase } from "../../domain/ports/in/process-note-remind.use-case";

@ApiTags("Notes")
@Controller(`${EndPointPrefixConstant}/internal/notes`)
export class TriggerNoteRemindController {
  constructor(
    @Inject(DIToken.NoteModule.ProcessNoteRemindUseCase)
    private readonly processNoteRemindUseCase: ProcessNoteRemindUseCase,
  ) {}

  @ApiOperation({ summary: "[임시] 노트 리마인더 배치 수동 실행" })
  @Post("remind")
  public async trigger(): Promise<void> {
    await this.processNoteRemindUseCase.invoke();
  }
}
