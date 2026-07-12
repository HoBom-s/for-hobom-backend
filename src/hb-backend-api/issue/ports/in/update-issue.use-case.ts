import { IssueId } from "../../domain/model/issue-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";

export interface UpdateIssueUseCase {
  invoke(
    id: IssueId,
    actor: UserId,
    data: Record<string, unknown>,
  ): Promise<void>;
}
