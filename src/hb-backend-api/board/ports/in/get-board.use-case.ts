import { BoardDocument } from "../../domain/model/board.schema";
import { BoardId } from "../../domain/model/board-id.vo";

export interface GetBoardUseCase {
  invoke(id: BoardId): Promise<BoardDocument>;
}
