export interface TodayMenuPayload {
  todayMenuId: string;
  name: string;
  username: string;
  nickname: string;
  email: string;
  userId: string;
}

export function createTodayMenuPayload(
  input: TodayMenuPayload,
): Record<string, string> {
  return {
    todayMenuId: input.todayMenuId,
    name: input.name,
    username: input.username,
    nickname: input.nickname,
    email: input.email,
    userId: input.userId,
  };
}
