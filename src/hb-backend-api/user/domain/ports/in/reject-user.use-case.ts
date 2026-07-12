import { UserId } from "../../model/user-id.vo";

export interface RejectUserUseCase {
  invoke(id: UserId): Promise<void>;
}
