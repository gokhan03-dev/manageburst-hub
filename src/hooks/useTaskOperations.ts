
import { useCallback } from "react";
import { Task, TaskStatus } from "@/types/task";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { transformTaskData } from "@/utils/taskTransforms";
import { Json } from "@/integrations/supabase/types";

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
      // Convert subtasks to Json type
      const subtasksJson = task.subtasks ? task.subtasks.map(st => ({
        text: st.text,
        completed: st.completed
      })) as Json : [];

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          due_date: task.dueDate,
          user_id: userId,
          subtasks: subtasksJson
        })
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

      // Convert subtasks to Json type
      const subtasksJson = updatedTask.subtasks ? updatedTask.subtasks.map(st => ({
        text: st.text,
        completed: st.completed
      })) as Json : [];

      const { error } = await supabase
        .from("tasks")
        .update({
          title: updatedTask.title,
          description: updatedTask.description,
          priority: updatedTask.priority,
          status: updatedTask.status,
          due_date: updatedTask.dueDate,
          subtasks: subtasksJson
        })
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
