
export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in-progress" | "completed";
export type RecurrencePattern = "daily" | "weekly" | "monthly" | "yearly";
export type WeekDay = "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday";
export type MonthlyRecurrenceType = "date" | "end-of-month";

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
  weeklyRecurrenceDays?: WeekDay[];
  monthlyRecurrenceType?: MonthlyRecurrenceType;
  monthlyRecurrenceDay?: number;
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
