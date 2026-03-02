import { UserId } from "../../model/user-id.vo";

export interface ApproveUserUseCase {
  invoke(id: UserId): Promise<void>;
}
