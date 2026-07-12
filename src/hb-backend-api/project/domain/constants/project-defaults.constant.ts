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
