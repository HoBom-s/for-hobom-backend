export interface TodayMenuPayload {
  todayMenuId: string;
  name: string;
}

export function createTodayMenuPayload(
  input: TodayMenuPayload,
): Record<string, string> {
  return {
    todayMenuId: input.todayMenuId,
    name: input.name,
  };
}
