import { BoardDocument } from "../../domain/model/board.schema";
import { ProjectId } from "../../../project/domain/model/project-id.vo";

export interface GetBoardsByProjectUseCase {
  invoke(projectId: ProjectId): Promise<BoardDocument[]>;
}
