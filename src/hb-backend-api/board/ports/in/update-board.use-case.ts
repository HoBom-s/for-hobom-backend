import { BoardId } from "../../domain/model/board-id.vo";

export interface UpdateBoardUseCase {
  invoke(id: BoardId, data: Record<string, unknown>): Promise<void>;
}
