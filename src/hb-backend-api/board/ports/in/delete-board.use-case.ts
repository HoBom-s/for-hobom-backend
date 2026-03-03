import { BoardId } from "../../domain/model/board-id.vo";

export interface DeleteBoardUseCase {
  invoke(id: BoardId): Promise<void>;
}
