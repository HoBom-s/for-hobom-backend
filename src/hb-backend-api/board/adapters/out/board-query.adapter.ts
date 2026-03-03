import { Inject, Injectable } from "@nestjs/common";
import { BoardQueryPort } from "../../ports/out/board-query.port";
import { DIToken } from "../../../../shared/di/token.di";
import { BoardRepository } from "../../domain/repositories/board.repository";
import { BoardDocument } from "../../domain/model/board.schema";
import { BoardId } from "../../domain/model/board-id.vo";
import { ProjectId } from "../../../project/domain/model/project-id.vo";

@Injectable()
export class BoardQueryAdapter implements BoardQueryPort {
  constructor(
    @Inject(DIToken.BoardModule.BoardRepository)
    private readonly boardRepository: BoardRepository,
  ) {}

  public async findById(id: BoardId): Promise<BoardDocument> {
    return this.boardRepository.findById(id);
  }

  public async findByProject(projectId: ProjectId): Promise<BoardDocument[]> {
    return this.boardRepository.findByProject(projectId);
  }
}
