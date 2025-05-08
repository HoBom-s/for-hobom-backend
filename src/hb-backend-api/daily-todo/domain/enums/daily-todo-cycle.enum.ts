/**
 * `daily-todo` 를 언제마다 반복하는지 판단하기 위한 enum
 * 매일, 평일, 주말
 */
export enum DailyTodoCycle {
  // 매일
  EVERYDAY = "EVERYDAY",

  // 평일
  EVERY_WEEKDAY = "EVERY_WEEKDAY",

  // 주말
  EVERY_WEEKEND = "EVERY_WEEKEND",
}
