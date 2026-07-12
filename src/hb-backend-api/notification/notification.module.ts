import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { NotificationEntity } from "./domain/model/notification.entity";
import { NotificationSchema } from "./domain/model/notification.schema";
import { DIToken } from "../../shared/di/token.di";
import { UserModule } from "../user/user.module";
import { OutboxModule } from "../outbox/outbox.module";
import { NotificationRepositoryImpl } from "./infra/repositories/notification.repository.impl";
import { NotificationPersistenceAdapter } from "./adapters/out/notification-persistence.adapter";
import { NotificationQueryAdapter } from "./adapters/out/notification-query.adapter";
import { CreateNotificationController } from "./adapters/in/create-notification.controller";
import { GetNotificationsController } from "./adapters/in/get-notifications.controller";
import { ReadNotificationController } from "./adapters/in/read-notification.controller";
import { CreateNotificationService } from "./application/use-cases/create-notification.service";
import { GetAllNotificationsService } from "./application/use-cases/get-all-notifications.service";
import { GetNotificationsCursorService } from "./application/use-cases/get-notifications-cursor.service";
import { ReadNotificationService } from "./application/use-cases/read-notification.service";
import { GetNotificationsCursorController } from "./adapters/in/get-notifications-cursor.controller";
import { ProcessExpiredNotificationCleanupService } from "./application/use-cases/process-expired-notification-cleanup.service";
import { ProcessExpiredNotificationCleanupScheduler } from "./adapters/in/process-expired-notification-cleanup.scheduler";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: NotificationEntity.name,
        schema: NotificationSchema,
      },
    ]),
    UserModule,
    OutboxModule,
  ],
  controllers: [
    CreateNotificationController,
    GetNotificationsController,
    GetNotificationsCursorController,
    ReadNotificationController,
  ],
  providers: [
    {
      provide: DIToken.NotificationModule.NotificationRepository,
      useClass: NotificationRepositoryImpl,
    },
    {
      provide: DIToken.NotificationModule.NotificationPersistencePort,
      useClass: NotificationPersistenceAdapter,
    },
    {
      provide: DIToken.NotificationModule.NotificationQueryPort,
      useClass: NotificationQueryAdapter,
    },
    {
      provide: DIToken.NotificationModule.CreateNotificationUseCase,
      useClass: CreateNotificationService,
    },
    {
      provide: DIToken.NotificationModule.GetAllNotificationsUseCase,
      useClass: GetAllNotificationsService,
    },
    {
      provide: DIToken.NotificationModule.GetNotificationsCursorUseCase,
      useClass: GetNotificationsCursorService,
    },
    {
      provide: DIToken.NotificationModule.ReadNotificationUseCase,
      useClass: ReadNotificationService,
    },
    {
      provide:
        DIToken.NotificationModule.ProcessExpiredNotificationCleanupUseCase,
      useClass: ProcessExpiredNotificationCleanupService,
    },
    ProcessExpiredNotificationCleanupScheduler,
  ],
  exports: [MongooseModule],
})
export class NotificationModule {}
