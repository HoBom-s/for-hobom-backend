import { ProjectDocument } from "../../domain/model/project.schema";
import { UserId } from "../../../user/domain/model/user-id.vo";

export interface GetMyProjectsUseCase {
  invoke(userId: UserId): Promise<ProjectDocument[]>;
}
