import { UserCreateEntitySchema } from "./user.entity";
import { UserId } from "./user-id.vo";
import { UserNickname } from "./user-nickname.vo";
import { UserDocument } from "./user.schema";

export interface UserRepository {
  save(user: UserCreateEntitySchema): Promise<void>;

  findById(id: UserId): Promise<UserDocument>;

  findAll(): Promise<UserDocument[]>;

  findByNickname(nickname: UserNickname): Promise<UserDocument>;
}
