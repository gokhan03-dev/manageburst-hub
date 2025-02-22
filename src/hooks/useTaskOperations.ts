
import { useCallback } from "react";
import { Task, TaskStatus } from "@/types/task";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { transformTaskData } from "@/utils/taskTransforms";

export const useTaskOperations = (tasks: Task[], setTasks: React.Dispatch<React.SetStateAction<Task[]>>, userId: string | undefined) => {
  const { toast } = useToast();

  const checkDependenciesCompleted = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task?.dependencies?.length) return true;

    const dependencyTasks = tasks.filter(t => 
      task.dependencies?.includes(t.id)
    );

    return dependencyTasks.every(t => t.status === "completed");
  }, [tasks]);

  const addTask = useCallback(async (task: Omit<Task, "id" | "createdAt">) => {
    try {
      const taskData = {
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        due_date: task.dueDate,
        user_id: userId,
        subtasks: JSON.stringify(task.subtasks || []),
        attendees: JSON.stringify(task.attendees || []),
        event_type: task.eventType,
        start_time: task.startTime,
        end_time: task.endTime,
        is_all_day: task.isAllDay,
        location: task.location,
        online_meeting_url: task.onlineMeetingUrl,
        reminder_minutes: task.reminderMinutes,
        tags: task.tags?.map(tag => tag.name) || [],
        category_ids: task.categoryIds || [],
        recurrence_pattern: task.recurrencePattern,
        recurrence_interval: task.recurrenceInterval,
        recurrence_start_date: task.recurrenceStartDate,
        recurrence_end_date: task.recurrenceEndDate,
        weekly_recurrence_days: task.weeklyRecurrenceDays,
        monthly_recurrence_type: task.monthlyRecurrenceType,
        monthly_recurrence_day: task.monthlyRecurrenceDay
      };

      const { data, error } = await supabase
        .from("tasks")
        .insert([taskData])
        .select()
        .single();

      if (error) throw error;

      if (task.dependencies?.length) {
        const dependencyPromises = task.dependencies.map(depId =>
          supabase
            .from("task_dependencies")
            .insert({
              dependent_task_id: data.id,
              dependency_task_id: depId,
            })
        );

        await Promise.all(dependencyPromises);
      }

      const newTask = transformTaskData(data);
      setTasks((prev) => [...prev, newTask]);
      
      toast({
        title: "Task created",
        description: "Your task has been created successfully.",
      });
    } catch (error: any) {
      console.error("Error adding task:", error);
      toast({
        title: "Error",
        description: error.message === 'Circular dependency detected' 
          ? "Cannot create circular dependencies between tasks"
          : "Failed to create task",
        variant: "destructive",
      });
    }
  }, [userId, toast, setTasks]);

  const updateTask = useCallback(async (updatedTask: Task) => {
    try {
      if (updatedTask.status === "completed") {
        const depsCompleted = await checkDependenciesCompleted(updatedTask.id);
        if (!depsCompleted) {
          throw new Error("Cannot complete task: dependencies are not completed");
        }
      }

      const taskData = {
        title: updatedTask.title,
        description: updatedTask.description,
        priority: updatedTask.priority,
        status: updatedTask.status,
        due_date: updatedTask.dueDate,
        subtasks: JSON.stringify(updatedTask.subtasks || []),
        attendees: JSON.stringify(updatedTask.attendees || []),
        event_type: updatedTask.eventType,
        start_time: updatedTask.startTime,
        end_time: updatedTask.endTime,
        is_all_day: updatedTask.isAllDay,
        location: updatedTask.location,
        online_meeting_url: updatedTask.onlineMeetingUrl,
        reminder_minutes: updatedTask.reminderMinutes,
        tags: updatedTask.tags?.map(tag => tag.name) || [],
        category_ids: updatedTask.categoryIds || [],
        recurrence_pattern: updatedTask.recurrencePattern,
        recurrence_interval: updatedTask.recurrenceInterval,
        recurrence_start_date: updatedTask.recurrenceStartDate,
        recurrence_end_date: updatedTask.recurrenceEndDate,
        weekly_recurrence_days: updatedTask.weeklyRecurrenceDays,
        monthly_recurrence_type: updatedTask.monthlyRecurrenceType,
        monthly_recurrence_day: updatedTask.monthlyRecurrenceDay
      };

      const { error } = await supabase
        .from("tasks")
        .update(taskData)
        .eq("id", updatedTask.id);

      if (error) throw error;

      setTasks((prev) =>
        prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
      toast({
        title: "Task updated",
        description: "Your task has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [toast, checkDependenciesCompleted, setTasks]);

  const deleteTask = useCallback(async (id: string) => {
    try {
      const { data: dependentTasks } = await supabase
        .from("task_dependencies")
        .select("dependent_task_id")
        .eq("dependency_task_id", id);

      if (dependentTasks?.length) {
        throw new Error("Cannot delete task: other tasks depend on it");
      }

      const { error } = await supabase.from("tasks").delete().eq("id", id);

      if (error) throw error;

      setTasks((prev) => prev.filter((task) => task.id !== id));
      toast({
        title: "Task deleted",
        description: "Your task has been deleted successfully.",
      });
    } catch (error: any) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [toast, setTasks]);

  return {
    addTask,
    updateTask,
    deleteTask,
    checkDependenciesCompleted,
  };
};
