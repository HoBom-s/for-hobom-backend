import { UserCreateEntitySchema } from "../../model/user.entity";

export interface UserPersistencePort {
  save(user: UserCreateEntitySchema): Promise<void>;
}
