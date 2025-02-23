
import { Task, TaskTag } from "@/types/task";
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
  subtasks: taskData.subtasks ? taskData.subtasks.map((st: any) => ({
    text: st.text,
    completed: st.completed
  })) : [],
  // Transform tag names back into TaskTag objects
  tags: taskData.tags ? taskData.tags.map((tagName: string) => ({
    id: tagName, // Using the name as id since we only store names
    name: tagName,
    color: generateTagColor() // We need to regenerate the color as it's not stored
  })) : [],
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

// Helper function to generate tag colors (same as in TagList component)
const generateTagColor = () => {
  const colors = [
    "#8B5CF6", // Vivid Purple
    "#0EA5E9", // Ocean Blue
    "#F97316", // Bright Orange
    "#D946EF", // Magenta Pink
    "#1EAEDB", // Bright Blue
    "#9b87f5"  // Primary Purple
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};
