import { UserEntitySchema } from "../../model/user.entity";
import { UserId } from "../../model/user-id.vo";
import { UserNickname } from "../../model/user-nickname.vo";

export interface UserQueryPort {
  findById(id: UserId): Promise<UserEntitySchema>;

  findByNickname(nickname: UserNickname): Promise<UserEntitySchema>;
}
