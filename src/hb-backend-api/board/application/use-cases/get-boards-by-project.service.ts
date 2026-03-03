import { Inject, Injectable } from "@nestjs/common";
import { GetBoardsByProjectUseCase } from "../../ports/in/get-boards-by-project.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { BoardQueryPort } from "../../ports/out/board-query.port";
import { BoardDocument } from "../../domain/model/board.schema";
import { ProjectId } from "../../../project/domain/model/project-id.vo";

@Injectable()
export class GetBoardsByProjectService implements GetBoardsByProjectUseCase {
  constructor(
    @Inject(DIToken.BoardModule.BoardQueryPort)
    private readonly boardQueryPort: BoardQueryPort,
  ) {}

  public async invoke(projectId: ProjectId): Promise<BoardDocument[]> {
    return this.boardQueryPort.findByProject(projectId);
  }
}
