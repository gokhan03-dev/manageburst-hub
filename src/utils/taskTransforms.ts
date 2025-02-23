
import { Task } from "@/types/task";
import { Json } from "@/integrations/supabase/types";

export const transformTaskData = (taskData: any): Task => ({
  id: taskData.id,
  title: taskData.title,
  description: taskData.description,
  priority: taskData.priority,
  status: taskData.status,
  dueDate: taskData.due_date,
  createdAt: taskData.created_at,
  dependencies: taskData.dependencies?.map((dep: any) => dep.dependency_task_id) || [],
  categoryIds: taskData.category_ids || [],
  subtasks: taskData.subtasks ? taskData.subtasks.map((st: Json) => ({
    text: st.text as string,
    completed: st.completed as boolean
  })) : [],
  tags: taskData.tags || [],
  eventType: taskData.event_type,
  startTime: taskData.start_time,
  endTime: taskData.end_time,
  isAllDay: taskData.is_all_day,
  location: taskData.location,
  attendees: taskData.attendees,
  recurrencePattern: taskData.recurrence_pattern,
  recurrenceInterval: taskData.recurrence_interval,
  recurrenceStartDate: taskData.recurrence_start_date,
  recurrenceEndDate: taskData.recurrence_end_date,
  weeklyRecurrenceDays: taskData.weekly_recurrence_days,
  monthlyRecurrenceType: taskData.monthly_recurrence_type,
  monthlyRecurrenceDay: taskData.monthly_recurrence_day,
  reminderMinutes: taskData.reminder_minutes,
  onlineMeetingUrl: taskData.online_meeting_url,
  sensitivity: taskData.sensitivity,
});
