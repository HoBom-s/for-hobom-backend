import { ProjectKey } from "../../domain/model/project-key.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";

export interface CreateProjectUseCase {
  invoke(
    key: ProjectKey,
    name: string,
    description: string | null,
    owner: UserId,
  ): Promise<void>;
}
