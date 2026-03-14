export interface GetDlqDetailUseCase {
  invoke(key: string): Promise<{ item: Record<string, unknown> }>;
}
