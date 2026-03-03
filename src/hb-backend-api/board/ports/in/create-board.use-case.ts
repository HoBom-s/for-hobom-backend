import { ProjectId } from "../../../project/domain/model/project-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { BoardType } from "../../domain/enums/board-type.enum";

export interface CreateBoardUseCase {
  invoke(
    projectId: ProjectId,
    name: string,
    type: BoardType,
    createdBy: UserId,
  ): Promise<void>;
}
