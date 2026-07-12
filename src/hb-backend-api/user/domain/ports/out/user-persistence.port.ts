import { UserCreateEntitySchema } from "../../model/user.entity";
import { UserId } from "../../model/user-id.vo";

export interface UserPersistencePort {
  save(user: UserCreateEntitySchema): Promise<void>;

  addFriend(ownerId: UserId, id: UserId): Promise<void>;
}
