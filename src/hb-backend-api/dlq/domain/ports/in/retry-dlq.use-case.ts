export interface RetryDlqUseCase {
  invoke(key: string): Promise<{ message: string }>;
}
