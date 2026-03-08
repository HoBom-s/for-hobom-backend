import { Module } from "@nestjs/common";
import { DIToken } from "../../shared/di/token.di";
import { UserModule } from "../user/user.module";
import { DailyTodoModule } from "../daily-todo/daily-todo.module";
import { CategoryModule } from "../category/category.module";
import { NoteModule } from "../note/note.module";
import { FutureMessageModule } from "../future-message/future-message.module";
import { NotificationModule } from "../notification/notification.module";
import { OutboxModule } from "../outbox/outbox.module";
import { IssueModule } from "../issue/issue.module";
import { SprintModule } from "../sprint/sprint.module";
import { ProjectModule } from "../project/project.module";
import { DashboardController } from "./adapters/in/rest/dashboard.controller";
import { GetDailyTodoDashboardService } from "./application/use-cases/get-daily-todo-dashboard.service";
import { GetNoteDashboardService } from "./application/use-cases/get-note-dashboard.service";
import { GetFutureMessageDashboardService } from "./application/use-cases/get-future-message-dashboard.service";
import { GetNotificationDashboardService } from "./application/use-cases/get-notification-dashboard.service";
import { GetSystemDashboardService } from "./application/use-cases/get-system-dashboard.service";
import { GetActivityDashboardService } from "./application/use-cases/get-activity-dashboard.service";
import { GetProjectIssueDashboardService } from "./application/use-cases/get-project-issue-dashboard.service";
import { GetSprintDashboardService } from "./application/use-cases/get-sprint-dashboard.service";

@Module({
  imports: [
    UserModule,
    DailyTodoModule,
    CategoryModule,
    NoteModule,
    FutureMessageModule,
    NotificationModule,
    OutboxModule,
    IssueModule,
    SprintModule,
    ProjectModule,
  ],
  controllers: [DashboardController],
  providers: [
    {
      provide: DIToken.DashboardModule.GetDailyTodoDashboardUseCase,
      useClass: GetDailyTodoDashboardService,
    },
    {
      provide: DIToken.DashboardModule.GetNoteDashboardUseCase,
      useClass: GetNoteDashboardService,
    },
    {
      provide: DIToken.DashboardModule.GetFutureMessageDashboardUseCase,
      useClass: GetFutureMessageDashboardService,
    },
    {
      provide: DIToken.DashboardModule.GetNotificationDashboardUseCase,
      useClass: GetNotificationDashboardService,
    },
    {
      provide: DIToken.DashboardModule.GetSystemDashboardUseCase,
      useClass: GetSystemDashboardService,
    },
    {
      provide: DIToken.DashboardModule.GetActivityDashboardUseCase,
      useClass: GetActivityDashboardService,
    },
    {
      provide: DIToken.DashboardModule.GetProjectIssueDashboardUseCase,
      useClass: GetProjectIssueDashboardService,
    },
    {
      provide: DIToken.DashboardModule.GetSprintDashboardUseCase,
      useClass: GetSprintDashboardService,
    },
  ],
})
export class DashboardModule {}
