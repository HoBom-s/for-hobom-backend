export interface ProcessExpiredNotificationCleanupUseCase {
  invoke(): Promise<void>;
}
