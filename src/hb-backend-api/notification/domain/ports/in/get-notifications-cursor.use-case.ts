import { UserId } from "../../../../user/domain/model/user-id.vo";
import { NotificationQueryResult } from "../out/notification-query.result";
import { CursorPaginatedResponse } from "../../../../../shared/pagination/cursor-paginated.response";

export interface GetNotificationsCursorUseCase {
  invoke(
    owner: UserId,
    cursor: string | undefined,
    size: number,
  ): Promise<CursorPaginatedResponse<NotificationQueryResult>>;
}
