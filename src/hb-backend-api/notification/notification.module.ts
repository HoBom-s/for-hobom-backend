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
import { ReadNotificationService } from "./application/use-cases/read-notification.service";

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
      provide: DIToken.NotificationModule.ReadNotificationUseCase,
      useClass: ReadNotificationService,
    },
  ],
})
export class NotificationModule {}
