import { UserId } from "../../../../user/domain/model/user-id.vo";

export interface EmptyTrashUseCase {
  invoke(owner: UserId): Promise<void>;
}
