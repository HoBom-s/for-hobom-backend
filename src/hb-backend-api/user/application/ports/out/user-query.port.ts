import { UserEntitySchema } from "../../../domain/entity/user.entity";
import { UserId } from "../../../domain/vo/user-id.vo";
import { UserNickname } from "../../../domain/vo/user-nickname.vo";

export interface UserQueryPort {
  findById(id: UserId): Promise<UserEntitySchema>;

  findByNickname(nickname: UserNickname): Promise<UserEntitySchema>;
}
