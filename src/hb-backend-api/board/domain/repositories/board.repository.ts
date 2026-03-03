import { CreateBoardEntity } from "../model/board.entity";
import { BoardDocument } from "../model/board.schema";
import { BoardId } from "../model/board-id.vo";
import { ProjectId } from "../../../project/domain/model/project-id.vo";

export interface BoardRepository {
  save(entity: CreateBoardEntity): Promise<void>;
  findById(id: BoardId): Promise<BoardDocument>;
  findByProject(projectId: ProjectId): Promise<BoardDocument[]>;
  update(id: BoardId, data: Record<string, unknown>): Promise<void>;
  deleteOne(id: BoardId): Promise<void>;
  deleteByProject(projectId: ProjectId): Promise<void>;
}
