import { Inject, Injectable } from "@nestjs/common";
import { GetNotificationsCursorUseCase } from "../../domain/ports/in/get-notifications-cursor.use-case";
import { NotificationQueryPort } from "../../domain/ports/out/notification-query.port";
import { NotificationQueryResult } from "../../domain/ports/out/notification-query.result";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { DIToken } from "../../../../shared/di/token.di";
import { CursorPaginatedResponse } from "../../../../shared/pagination/cursor-paginated.response";

@Injectable()
export class GetNotificationsCursorService
  implements GetNotificationsCursorUseCase
{
  constructor(
    @Inject(DIToken.NotificationModule.NotificationQueryPort)
    private readonly notificationQueryPort: NotificationQueryPort,
  ) {}

  public async invoke(
    owner: UserId,
    cursor: string | undefined,
    size: number,
  ): Promise<CursorPaginatedResponse<NotificationQueryResult>> {
    const notifications =
      await this.notificationQueryPort.findByOwnerWithCursor(
        owner,
        cursor,
        size + 1,
      );
    const results = notifications.map(NotificationQueryResult.from);
    return CursorPaginatedResponse.of(results, size, (r) =>
      r.getId.toString(),
    );
  }
}
