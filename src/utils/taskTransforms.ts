
import { Task } from "@/types/task";

const safeParseJSON = (jsonString: string | null, defaultValue: any = []) => {
  if (!jsonString) return defaultValue;
  try {
    return JSON.parse(jsonString);
  } catch {
    return defaultValue;
  }
};

export const transformTaskData = (taskData: any): Task => ({
  id: taskData.id,
  title: taskData.title,
  description: taskData.description || '',
  priority: taskData.priority || 'medium',
  status: taskData.status || 'todo',
  dueDate: taskData.due_date || null,
  createdAt: taskData.created_at || new Date().toISOString(),
  dependencies: Array.isArray(taskData.dependencies) 
    ? taskData.dependencies.map((dep: any) => dep.dependency_task_id)
    : [],
  categoryIds: taskData.category_ids || [],
  subtasks: safeParseJSON(taskData.subtasks, []),
  tags: Array.isArray(taskData.tags) 
    ? taskData.tags.map((tagName: string) => ({ 
        id: '', 
        name: tagName, 
        color: '' 
      }))
    : [],
  eventType: taskData.event_type || null,
  startTime: taskData.start_time || null,
  endTime: taskData.end_time || null,
  isAllDay: taskData.is_all_day || false,
  location: taskData.location || null,
  attendees: safeParseJSON(taskData.attendees, []),
  recurrencePattern: taskData.recurrence_pattern || null,
  recurrenceInterval: taskData.recurrence_interval || null,
  recurrenceStartDate: taskData.recurrence_start_date || null,
  recurrenceEndDate: taskData.recurrence_end_date || null,
  weeklyRecurrenceDays: taskData.weekly_recurrence_days || [],
  monthlyRecurrenceType: taskData.monthly_recurrence_type || null,
  monthlyRecurrenceDay: taskData.monthly_recurrence_day || null,
  reminderMinutes: taskData.reminder_minutes || null,
  onlineMeetingUrl: taskData.online_meeting_url || null
});
