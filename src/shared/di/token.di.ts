import { DITokenRegister } from "./token-registry.di";

export class DIToken {
  public static readonly AuthModule = class extends DITokenRegister {
    public static AuthRepository = this.register("AuthRepository");

    public static JwtAuthPort = this.register("JwtAuthPort");

    public static AuthPersistencePort = this.register("AuthPersistencePort");
    public static AuthQueryPort = this.register("AuthQueryPort");

    public static LoginAuthUseCase = this.register("LoginAuthUseCase");
    public static RefreshAuthTokenUseCase = this.register(
      "RefreshAuthTokenUseCase",
    );
    public static LogoutAuthUseCase = this.register("LogoutAuthUseCase");
  };

  public static readonly UserModule = class extends DITokenRegister {
    public static UserRepository = this.register("UserRepository");

    public static UserPersistencePort = this.register("UserPersistencePort");
    public static UserQueryPort = this.register("UserQueryPort");

    public static CreateUserUseCase = this.register("CreateUserUseCase");
    public static GetUserUseCase = this.register("GetUserUseCase");
    public static GetUserByNicknameUseCase = this.register(
      "GetUserByNicknameUseCase",
    );
    public static GetAllUserUseCase = this.register("GetAllUserUseCase");
    public static ApproveUserUseCase = this.register("ApproveUserUseCase");
    public static RejectUserUseCase = this.register("RejectUserUseCase");
    public static GetPendingUsersUseCase = this.register(
      "GetPendingUsersUseCase",
    );
  };

  public static readonly CategoryModule = class extends DITokenRegister {
    public static CategoryRepository = this.register("CategoryRepository");

    public static CategoryPersistencePort = this.register(
      "CategoryPersistencePort",
    );
    public static CategoryQueryPort = this.register("CategoryQueryPort");

    public static CreateCategoryUseCase = this.register(
      "CreateCategoryUseCase",
    );
    public static GetAllCategoryUseCase = this.register(
      "GetAllCategoryUseCase",
    );
    public static GetCategoryUseCase = this.register("GetCategoryUseCase");
    public static PatchCategoryUseCase = this.register("PatchCategoryUseCase");
    public static DeleteCategoryUseCase = this.register(
      "DeleteCategoryUseCase",
    );
  };

  public static readonly DailyTodoModule = class extends DITokenRegister {
    public static DailyTodoRepository = this.register("DailyTodoRepository");

    public static DailyTodoPersistencePort = this.register(
      "DailyTodoPersistencePort",
    );
    public static DailyTodoQueryPort = this.register("DailyTodoQueryPort");

    public static CreateDailyTodoUseCase = this.register(
      "CreateDailyTodoUseCase",
    );
    public static GetAllDailyTodoUseCase = this.register(
      "GetAllDailyTodoUseCase",
    );
    public static GetDailyTodoUseCase = this.register("GetDailyTodoUseCase");
    public static UpdateDailyTodoCompleteStatusUseCase = this.register(
      "UpdateDailyTodoCompleteStatusUseCase",
    );
    public static UpdateDailyTodoCycleUseCase = this.register(
      "UpdateDailyTodoCycleUseCase",
    );
    public static UpdateDailyTodoReactionUseCase = this.register(
      "UpdateDailyTodoReactionUseCase",
    );
    public static GetDailyTodoByDateUseCase = this.register(
      "GetDailyTodoByDateUseCase",
    );
    public static UpdateDailyTodoUseCase = this.register(
      "UpdateDailyTodoUseCase",
    );
    public static DeleteDailyTodoUseCase = this.register(
      "DeleteDailyTodoUseCase",
    );
    public static ProcessDailyTodoRecurrenceUseCase = this.register(
      "ProcessDailyTodoRecurrenceUseCase",
    );
  };

  public static readonly MenuRecommendationModule = class extends DITokenRegister {
    public static MenuRecommendationRepository = this.register(
      "MenuRecommendationRepository",
    );

    public static MenuRecommendationPersistencePort = this.register(
      "MenuRecommendationPersistencePort",
    );
    public static MenuRecommendationQueryPort = this.register(
      "MenuRecommendationQueryPort",
    );

    public static CreateMenuRecommendationUseCase = this.register(
      "CreateMenuRecommendationUseCase",
    );
    public static FindAllMenuRecommendationUseCase = this.register(
      "FindAllMenuRecommendationUseCase",
    );
  };

  public static readonly TodayMenuModule = class extends DITokenRegister {
    public static TodayMenuRepository = this.register("TodayMenuRepository");

    public static TodayMenuPersistencePort = this.register(
      "TodayMenuPersistencePort",
    );
    public static TodayMenuQueryPort = this.register("TodayMenuQueryPort");

    public static UpsertTodayMenuUseCase = this.register(
      "UpsertTodayMenuUseCase",
    );
    public static FindTodayMenuByIdUseCase = this.register(
      "FindTodayMenuByIdUseCase",
    );
    public static PickTodayMenuUseCase = this.register("PickTodayMenuUseCase");
  };

  public static readonly LabelModule = class extends DITokenRegister {
    public static LabelRepository = this.register("LabelRepository");

    public static LabelPersistencePort = this.register("LabelPersistencePort");
    public static LabelQueryPort = this.register("LabelQueryPort");

    public static CreateLabelUseCase = this.register("CreateLabelUseCase");
    public static GetAllLabelsUseCase = this.register("GetAllLabelsUseCase");
    public static GetLabelUseCase = this.register("GetLabelUseCase");
    public static PatchLabelUseCase = this.register("PatchLabelUseCase");
    public static DeleteLabelUseCase = this.register("DeleteLabelUseCase");
  };

  public static readonly NoteModule = class extends DITokenRegister {
    public static NoteRepository = this.register("NoteRepository");

    public static NotePersistencePort = this.register("NotePersistencePort");
    public static NoteQueryPort = this.register("NoteQueryPort");

    public static CreateNoteUseCase = this.register("CreateNoteUseCase");
    public static GetAllNotesUseCase = this.register("GetAllNotesUseCase");
    public static GetNoteByIdUseCase = this.register("GetNoteByIdUseCase");
    public static UpdateNoteUseCase = this.register("UpdateNoteUseCase");
    public static UpdateNoteStatusUseCase = this.register(
      "UpdateNoteStatusUseCase",
    );
    public static ToggleNotePinUseCase = this.register("ToggleNotePinUseCase");
    public static ReorderNoteUseCase = this.register("ReorderNoteUseCase");
    public static DeleteNoteUseCase = this.register("DeleteNoteUseCase");
    public static EmptyTrashUseCase = this.register("EmptyTrashUseCase");
    public static ProcessNoteRemindUseCase = this.register(
      "ProcessNoteRemindUseCase",
    );
    public static ProcessNoteDestroyUseCase = this.register(
      "ProcessNoteDestroyUseCase",
    );
  };

  public static readonly NotificationModule = class extends DITokenRegister {
    public static NotificationRepository = this.register(
      "NotificationRepository",
    );

    public static NotificationPersistencePort = this.register(
      "NotificationPersistencePort",
    );
    public static NotificationQueryPort = this.register(
      "NotificationQueryPort",
    );

    public static CreateNotificationUseCase = this.register(
      "CreateNotificationUseCase",
    );
    public static GetAllNotificationsUseCase = this.register(
      "GetAllNotificationsUseCase",
    );
    public static GetNotificationsCursorUseCase = this.register(
      "GetNotificationsCursorUseCase",
    );
    public static ReadNotificationUseCase = this.register(
      "ReadNotificationUseCase",
    );
    public static ProcessExpiredNotificationCleanupUseCase = this.register(
      "ProcessExpiredNotificationCleanupUseCase",
    );
  };

  public static readonly OutboxModule = class extends DITokenRegister {
    public static OutboxRepository = this.register("OutboxRepository");

    public static OutboxPersistencePort = this.register(
      "OutboxPersistencePort",
    );
    public static OutboxQueryPort = this.register("OutboxQueryPort");

    public static FindOutboxByEventTypeAndStatusUseCase = this.register(
      "FindOutboxByEventTypeAndStatusUseCase",
    );
    public static FindLogOutboxByEventTypeAndStatusUseCase = this.register(
      "FindLogOutboxByEventTypeAndStatusUseCase",
    );
    public static PatchOutboxMarkAsSentUseCase = this.register(
      "PatchOutboxMarkAsSentUseCase",
    );
    public static ProcessExpiredOutboxCleanupUseCase = this.register(
      "ProcessExpiredOutboxCleanupUseCase",
    );
  };

  public static readonly DashboardModule = class extends DITokenRegister {
    public static GetDailyTodoDashboardUseCase = this.register(
      "GetDailyTodoDashboardUseCase",
    );
    public static GetNoteDashboardUseCase = this.register(
      "GetNoteDashboardUseCase",
    );
    public static GetFutureMessageDashboardUseCase = this.register(
      "GetFutureMessageDashboardUseCase",
    );
    public static GetNotificationDashboardUseCase = this.register(
      "GetNotificationDashboardUseCase",
    );
    public static GetSystemDashboardUseCase = this.register(
      "GetSystemDashboardUseCase",
    );
    public static GetActivityDashboardUseCase = this.register(
      "GetActivityDashboardUseCase",
    );
  };

  public static readonly FutureMessageModule = class extends DITokenRegister {
    public static FutureMessagePersistenceRepository = this.register(
      "FutureMessagePersistenceRepository",
    );
    public static FutureMessageQueryRepository = this.register(
      "FutureMessageQueryRepository",
    );

    public static FutureMessagePersistencePort = this.register(
      "FutureMessagePersistencePort",
    );
    public static FutureMessageQueryPort = this.register(
      "FutureMessageQueryPort",
    );

    public static CreateFutureMessageUseCase = this.register(
      "CreateFutureMessageUseCase",
    );
    public static FindAllFutureMessageByStatusUseCase = this.register(
      "FindAllFutureMessageByStatusUseCase",
    );
    public static FindFutureMessageByIdUseCase = this.register(
      "FindFutureMessageByIdUseCase",
    );
    public static UpdateFutureMessageUseCase = this.register(
      "UpdateFutureMessageUseCase",
    );
    public static DeleteFutureMessageUseCase = this.register(
      "DeleteFutureMessageUseCase",
    );
    public static ProcessScheduleFutureMessageUseCase = this.register(
      "ProcessScheduleFutureMessageUseCase",
    );
  };

  public static readonly ProjectModule = class extends DITokenRegister {
    public static ProjectRepository = this.register("ProjectRepository");

    public static ProjectPersistencePort = this.register(
      "ProjectPersistencePort",
    );
    public static ProjectQueryPort = this.register("ProjectQueryPort");

    public static CreateProjectUseCase = this.register("CreateProjectUseCase");
    public static GetProjectUseCase = this.register("GetProjectUseCase");
    public static GetMyProjectsUseCase = this.register("GetMyProjectsUseCase");
    public static UpdateProjectUseCase = this.register("UpdateProjectUseCase");
    public static DeleteProjectUseCase = this.register("DeleteProjectUseCase");
    public static AddProjectMemberUseCase = this.register(
      "AddProjectMemberUseCase",
    );
    public static RemoveProjectMemberUseCase = this.register(
      "RemoveProjectMemberUseCase",
    );
    public static UpdateProjectMemberRoleUseCase = this.register(
      "UpdateProjectMemberRoleUseCase",
    );
    public static UpdateProjectWorkflowUseCase = this.register(
      "UpdateProjectWorkflowUseCase",
    );
    public static UpdateProjectIssueTypesUseCase = this.register(
      "UpdateProjectIssueTypesUseCase",
    );
    public static UpdateProjectPrioritiesUseCase = this.register(
      "UpdateProjectPrioritiesUseCase",
    );
  };

  public static readonly IssueModule = class extends DITokenRegister {
    public static IssueRepository = this.register("IssueRepository");
    public static IssueCommentRepository = this.register(
      "IssueCommentRepository",
    );
    public static IssueHistoryRepository = this.register(
      "IssueHistoryRepository",
    );

    public static IssuePersistencePort = this.register("IssuePersistencePort");
    public static IssueCommentPersistencePort = this.register(
      "IssueCommentPersistencePort",
    );
    public static IssueHistoryPersistencePort = this.register(
      "IssueHistoryPersistencePort",
    );

    public static IssueQueryPort = this.register("IssueQueryPort");
    public static IssueCommentQueryPort = this.register(
      "IssueCommentQueryPort",
    );
    public static IssueHistoryQueryPort = this.register(
      "IssueHistoryQueryPort",
    );

    public static CreateIssueUseCase = this.register("CreateIssueUseCase");
    public static GetIssueUseCase = this.register("GetIssueUseCase");
    public static GetIssuesByProjectUseCase = this.register(
      "GetIssuesByProjectUseCase",
    );
    public static UpdateIssueUseCase = this.register("UpdateIssueUseCase");
    public static DeleteIssueUseCase = this.register("DeleteIssueUseCase");
    public static TransitionIssueStatusUseCase = this.register(
      "TransitionIssueStatusUseCase",
    );
    public static AssignIssueUseCase = this.register("AssignIssueUseCase");
    public static CreateIssueCommentUseCase = this.register(
      "CreateIssueCommentUseCase",
    );
    public static UpdateIssueCommentUseCase = this.register(
      "UpdateIssueCommentUseCase",
    );
    public static DeleteIssueCommentUseCase = this.register(
      "DeleteIssueCommentUseCase",
    );
    public static GetIssueCommentsUseCase = this.register(
      "GetIssueCommentsUseCase",
    );
    public static GetIssueHistoryUseCase = this.register(
      "GetIssueHistoryUseCase",
    );
  };

  public static readonly SprintModule = class extends DITokenRegister {
    public static SprintRepository = this.register("SprintRepository");

    public static SprintPersistencePort = this.register(
      "SprintPersistencePort",
    );
    public static SprintQueryPort = this.register("SprintQueryPort");

    public static CreateSprintUseCase = this.register("CreateSprintUseCase");
    public static GetSprintUseCase = this.register("GetSprintUseCase");
    public static GetSprintsByProjectUseCase = this.register(
      "GetSprintsByProjectUseCase",
    );
    public static UpdateSprintUseCase = this.register("UpdateSprintUseCase");
    public static DeleteSprintUseCase = this.register("DeleteSprintUseCase");
    public static StartSprintUseCase = this.register("StartSprintUseCase");
    public static CompleteSprintUseCase = this.register(
      "CompleteSprintUseCase",
    );
  };

  public static readonly BoardModule = class extends DITokenRegister {
    public static BoardRepository = this.register("BoardRepository");

    public static BoardPersistencePort = this.register("BoardPersistencePort");
    public static BoardQueryPort = this.register("BoardQueryPort");

    public static CreateBoardUseCase = this.register("CreateBoardUseCase");
    public static GetBoardUseCase = this.register("GetBoardUseCase");
    public static GetBoardsByProjectUseCase = this.register(
      "GetBoardsByProjectUseCase",
    );
    public static UpdateBoardUseCase = this.register("UpdateBoardUseCase");
    public static DeleteBoardUseCase = this.register("DeleteBoardUseCase");
  };

  public static readonly ProjectLabelModule = class extends DITokenRegister {
    public static ProjectLabelRepository = this.register(
      "ProjectLabelRepository",
    );

    public static ProjectLabelPersistencePort = this.register(
      "ProjectLabelPersistencePort",
    );
    public static ProjectLabelQueryPort = this.register(
      "ProjectLabelQueryPort",
    );

    public static CreateProjectLabelUseCase = this.register(
      "CreateProjectLabelUseCase",
    );
    public static GetProjectLabelsUseCase = this.register(
      "GetProjectLabelsUseCase",
    );
    public static UpdateProjectLabelUseCase = this.register(
      "UpdateProjectLabelUseCase",
    );
    public static DeleteProjectLabelUseCase = this.register(
      "DeleteProjectLabelUseCase",
    );
  };
}
