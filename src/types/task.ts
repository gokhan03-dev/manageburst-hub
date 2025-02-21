
export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in-progress" | "completed";
export type RecurrencePattern = "daily" | "weekly" | "monthly" | "yearly";

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
  dependencies?: string[];
  categoryIds?: string[];
  recurrencePattern?: RecurrencePattern;
  recurrenceInterval?: number;
  recurrenceStartDate?: string;
  recurrenceEndDate?: string;
  nextOccurrence?: string;
  lastOccurrence?: string;
  scheduleStartDate?: string;
}

export interface TaskDependency {
  id: string;
  dependent_task_id: string;
  dependency_task_id: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}
