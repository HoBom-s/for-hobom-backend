export interface ProcessScheduleFutureMessageUseCase {
  invoke(): Promise<void>;
}
