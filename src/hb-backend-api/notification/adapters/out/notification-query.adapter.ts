import { Inject, Injectable } from "@nestjs/common";
import { NotificationQueryPort } from "../../domain/ports/out/notification-query.port";
import { DIToken } from "../../../../shared/di/token.di";
import { NotificationRepository } from "../../domain/model/notification.repository";
import { NotificationEntitySchema } from "../../domain/model/notification.entity";
import { NotificationId } from "../../domain/model/notification-id.vo";
import { UserId } from "../../../user/domain/model/user-id.vo";
import { NotificationDocument } from "../../domain/model/notification.schema";
import { NotificationCategory } from "../../domain/enums/notification-category.enum";

@Injectable()
export class NotificationQueryAdapter implements NotificationQueryPort {
  constructor(
    @Inject(DIToken.NotificationModule.NotificationRepository)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  public async findAllByOwner(
    owner: UserId,
  ): Promise<NotificationEntitySchema[]> {
    const docs = await this.notificationRepository.findAllByOwner(owner);
    if (docs.length === 0) return [];
    return docs.map((doc) => this.toEntity(doc));
  }

  public async findByOwnerWithCursor(
    owner: UserId,
    cursor: string | undefined,
    limit: number,
  ): Promise<NotificationEntitySchema[]> {
    const docs = await this.notificationRepository.findByOwnerWithCursor(
      owner,
      cursor,
      limit,
    );
    if (docs.length === 0) return [];
    return docs.map((doc) => this.toEntity(doc));
  }

  private toEntity(doc: NotificationDocument): NotificationEntitySchema {
    return NotificationEntitySchema.of(
      NotificationId.fromString(String(doc._id)),
      doc.category as NotificationCategory,
      UserId.fromString(String(doc.owner)),
      doc.title,
      doc.body,
      doc.senderId,
      doc.isRead,
      doc.createdAt,
    );
  }
}
