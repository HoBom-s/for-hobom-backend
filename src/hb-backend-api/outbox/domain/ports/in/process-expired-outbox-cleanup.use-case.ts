export interface ProcessExpiredOutboxCleanupUseCase {
  invoke(): Promise<void>;
}
