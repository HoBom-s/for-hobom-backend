export interface DlqProxyPort {
  getList(prefix?: string): Promise<{ items: string[] }>;
  getByKey(key: string): Promise<{ item: Record<string, unknown> }>;
  retry(key: string): Promise<{ message: string }>;
}
