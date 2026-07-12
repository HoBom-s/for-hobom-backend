import { UserEntitySchema } from "../../model/user.entity";
import { UserId } from "../../model/user-id.vo";
import { UserNickname } from "../../model/user-nickname.vo";
import { ApprovalStatus } from "../../enums/approval-status.enum";

export interface UserQueryPort {
  findById(id: UserId): Promise<UserEntitySchema>;

  findAll(): Promise<UserEntitySchema[]>;

  findByNickname(nickname: UserNickname): Promise<UserEntitySchema>;

  findPendingUsers(): Promise<UserEntitySchema[]>;

  updateApprovalStatus(id: UserId, status: ApprovalStatus): Promise<void>;
}
