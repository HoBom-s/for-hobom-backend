import { Inject, Injectable } from "@nestjs/common";
import { GetBoardUseCase } from "../../ports/in/get-board.use-case";
import { DIToken } from "../../../../shared/di/token.di";
import { BoardQueryPort } from "../../ports/out/board-query.port";
import { BoardDocument } from "../../domain/model/board.schema";
import { BoardId } from "../../domain/model/board-id.vo";

@Injectable()
export class GetBoardService implements GetBoardUseCase {
  constructor(
    @Inject(DIToken.BoardModule.BoardQueryPort)
    private readonly boardQueryPort: BoardQueryPort,
  ) {}

  public async invoke(id: BoardId): Promise<BoardDocument> {
    return this.boardQueryPort.findById(id);
  }
}
