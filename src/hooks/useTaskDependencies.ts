
import { useCallback } from "react";
import { Task } from "@/types/task";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useTaskDependencies = (tasks: Task[], setTasks: React.Dispatch<React.SetStateAction<Task[]>>) => {
  const { toast } = useToast();

  const addDependency = useCallback(async (taskId: string, dependencyId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      const dependencyTask = tasks.find(t => t.id === dependencyId);
      
      if (task && dependencyTask && new Date(task.dueDate) < new Date(dependencyTask.dueDate)) {
        throw new Error("Dependent task due date must be after dependency due date");
      }

      const { error } = await supabase
        .from("task_dependencies")
        .insert([
          {
            dependent_task_id: taskId,
            dependency_task_id: dependencyId,
          },
        ]);

      if (error) throw error;

      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? { ...task, dependencies: [...(task.dependencies || []), dependencyId] }
            : task
        )
      );
      toast({
        title: "Dependency added",
        description: "Task dependency has been added successfully.",
      });
    } catch (error: any) {
      console.error("Error adding dependency:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [tasks, toast, setTasks]);

  const removeDependency = useCallback(async (taskId: string, dependencyId: string) => {
    try {
      const { error } = await supabase
        .from("task_dependencies")
        .delete()
        .match({
          dependent_task_id: taskId,
          dependency_task_id: dependencyId,
        });

      if (error) throw error;

      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? {
                ...task,
                dependencies: (task.dependencies || []).filter((id) => id !== dependencyId),
              }
            : task
        )
      );
      toast({
        title: "Dependency removed",
        description: "Task dependency has been removed successfully.",
      });
    } catch (error) {
      console.error("Error removing dependency:", error);
      toast({
        title: "Error",
        description: "Failed to remove dependency",
        variant: "destructive",
      });
    }
  }, [toast, setTasks]);

  return {
    addDependency,
    removeDependency,
  };
};
