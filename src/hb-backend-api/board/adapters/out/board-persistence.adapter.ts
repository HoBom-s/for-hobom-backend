import { Inject, Injectable } from "@nestjs/common";
import { BoardPersistencePort } from "../../ports/out/board-persistence.port";
import { CreateBoardEntity } from "../../domain/model/board.entity";
import { BoardId } from "../../domain/model/board-id.vo";
import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { DIToken } from "../../../../shared/di/token.di";
import { BoardRepository } from "../../domain/repositories/board.repository";

@Injectable()
export class BoardPersistenceAdapter implements BoardPersistencePort {
  constructor(
    @Inject(DIToken.BoardModule.BoardRepository)
    private readonly boardRepository: BoardRepository,
  ) {}

  public async save(entity: CreateBoardEntity): Promise<void> {
    await this.boardRepository.save(entity);
  }

  public async update(
    id: BoardId,
    data: Record<string, unknown>,
  ): Promise<void> {
    await this.boardRepository.update(id, data);
  }

  public async deleteOne(id: BoardId): Promise<void> {
    await this.boardRepository.deleteOne(id);
  }

  public async deleteByProject(projectId: ProjectId): Promise<void> {
    await this.boardRepository.deleteByProject(projectId);
  }
}
