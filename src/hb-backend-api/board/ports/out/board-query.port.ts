import { BoardDocument } from "../../domain/model/board.schema";
import { BoardId } from "../../domain/model/board-id.vo";
import { ProjectId } from "../../../project/domain/model/project-id.vo";

export interface BoardQueryPort {
  findById(id: BoardId): Promise<BoardDocument>;
  findByProject(projectId: ProjectId): Promise<BoardDocument[]>;
}
