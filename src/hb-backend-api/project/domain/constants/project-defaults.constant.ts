import { StatusCategory } from "../enums/status-category.enum";

export const DEFAULT_WORKFLOW = {
  statuses: [
    { id: "todo", name: "할 일", category: StatusCategory.TODO, order: 0 },
    {
      id: "in-progress",
      name: "진행 중",
      category: StatusCategory.IN_PROGRESS,
      order: 1,
    },
    { id: "done", name: "완료", category: StatusCategory.DONE, order: 2 },
  ],
  transitions: [
    { from: "todo", to: "in-progress", name: "작업 시작" },
    { from: "in-progress", to: "done", name: "완료" },
    { from: "in-progress", to: "todo", name: "되돌리기" },
    { from: "done", to: "in-progress", name: "재오픈" },
  ],
} as const;

export const DEFAULT_ISSUE_TYPES = [
  { id: "epic", name: "에픽", icon: "epic", isSubtask: false },
  { id: "story", name: "스토리", icon: "story", isSubtask: false },
  { id: "task", name: "태스크", icon: "task", isSubtask: false },
  { id: "bug", name: "버그", icon: "bug", isSubtask: false },
  { id: "subtask", name: "하위 작업", icon: "subtask", isSubtask: true },
] as const;

export const DEFAULT_PRIORITIES = [
  { id: "critical", name: "긴급", icon: "critical", order: 0 },
  { id: "high", name: "높음", icon: "high", order: 1 },
  { id: "medium", name: "보통", icon: "medium", order: 2 },
  { id: "low", name: "낮음", icon: "low", order: 3 },
] as const;
