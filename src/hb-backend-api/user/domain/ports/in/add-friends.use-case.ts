import { UserId } from "../../model/user-id.vo";

export interface AddFriendsUseCase {
  invoke(ownerId: UserId, id: UserId): Promise<void>;
}
