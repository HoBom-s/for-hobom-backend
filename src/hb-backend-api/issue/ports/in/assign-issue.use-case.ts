import { IssueId } from "../../domain/model/issue-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";

export interface AssignIssueUseCase {
  invoke(id: IssueId, assignee: UserId | null, actor: UserId): Promise<void>;
}
