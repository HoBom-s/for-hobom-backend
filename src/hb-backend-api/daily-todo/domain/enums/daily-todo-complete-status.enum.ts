/**
 * 완료 여부에 대한 status
 * Boolean 으로 충분히 판단 가능하지만, 이후 확장성을 고려하여 enum 으로 정의
 *
 * 완료, 진행중
 */
export enum DailyTodoCompleteStatus {
  // 완료
  COMPLETED = "COMPLETED",

  // 진행중
  PROGRESS = "PROGRESS",
}
