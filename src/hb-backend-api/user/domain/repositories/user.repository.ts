import { UserEntity, UserEntitySchema } from "../entity/user.entity";

export interface UserRepository {
  save(user: UserEntitySchema): Promise<void>;

  findById(id: string): Promise<UserEntity>;

  findByNickname(nickname: string): Promise<UserEntity>;
}
