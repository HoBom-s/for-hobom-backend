import { UserCreateEntitySchema } from "../entity/user.entity";
import { UserId } from "../vo/user-id.vo";
import { UserNickname } from "../vo/user-nickname.vo";
import { UserDocument } from "../entity/user.schema";

export interface UserRepository {
  save(user: UserCreateEntitySchema): Promise<void>;

  findById(id: UserId): Promise<UserDocument>;

  findByNickname(nickname: UserNickname): Promise<UserDocument>;
}
