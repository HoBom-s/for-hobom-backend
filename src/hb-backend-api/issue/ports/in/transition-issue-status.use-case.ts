import { IssueId } from "../../domain/model/issue-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";

export interface TransitionIssueStatusUseCase {
  invoke(id: IssueId, newStatusId: string, actor: UserId): Promise<void>;
}
