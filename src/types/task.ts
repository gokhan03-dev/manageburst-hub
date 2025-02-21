
export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in-progress" | "completed";
export type RecurrencePattern = "daily" | "weekly" | "monthly" | "yearly";
export type WeekDay = "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday";
export type MonthlyRecurrenceType = "date" | "end-of-month";
export type EventType = "task" | "meeting" | "appointment" | "reminder";
export type Sensitivity = "normal" | "private" | "confidential";
export type AttendeeResponse = "accepted" | "tentative" | "declined";

export interface Attendee {
  email: string;
  required: boolean;
  response?: AttendeeResponse;
}

export interface RecurrenceSettings {
  pattern: RecurrencePattern;
  interval: number;
  endDate?: string;
  weeklyRecurrenceDays?: WeekDay[];
  monthlyRecurrenceType?: MonthlyRecurrenceType;
  monthlyRecurrenceDay?: number;
}

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
  
  // Calendar integration fields
  eventType?: EventType;
  startTime?: string;
  endTime?: string;
  isAllDay?: boolean;
  location?: string;
  attendees?: Attendee[];
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
  reminderMinutes?: number;
  onlineMeetingUrl?: string;
  sensitivity?: Sensitivity;
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

export class CalendarSyncError extends Error {
  constructor(
    message: string,
    public readonly type: 'auth' | 'network' | 'permission' | 'other',
    public readonly retryable: boolean
  ) {
    super(message);
    this.name = 'CalendarSyncError';
  }
}
