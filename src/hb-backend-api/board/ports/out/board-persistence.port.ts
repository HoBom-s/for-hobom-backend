import { CreateBoardEntity } from "../../domain/model/board.entity";
import { BoardId } from "../../domain/model/board-id.vo";
import { ProjectId } from "../../../project/domain/model/project-id.vo";

export interface BoardPersistencePort {
  save(entity: CreateBoardEntity): Promise<void>;
  update(id: BoardId, data: Record<string, unknown>): Promise<void>;
  deleteOne(id: BoardId): Promise<void>;
  deleteByProject(projectId: ProjectId): Promise<void>;
}
