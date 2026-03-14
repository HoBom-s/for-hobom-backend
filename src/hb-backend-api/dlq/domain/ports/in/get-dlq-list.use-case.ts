export interface GetDlqListUseCase {
  invoke(prefix?: string): Promise<{ items: string[] }>;
}
