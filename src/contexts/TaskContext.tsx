
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Task, TaskStatus } from "@/types/task";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "createdAt">) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  addDependency: (taskId: string, dependencyId: string) => Promise<void>;
  removeDependency: (taskId: string, dependencyId: string) => Promise<void>;
  loading: boolean;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Helper function to transform Supabase task data to our Task interface
const transformTaskData = (taskData: any): Task => ({
  id: taskData.id,
  title: taskData.title,
  description: taskData.description,
  priority: taskData.priority,
  status: taskData.status,
  dueDate: taskData.due_date,
  createdAt: taskData.created_at,
  dependencies: taskData.dependencies?.map((dep: any) => dep.dependency_task_id) || [],
});

export const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch tasks and dependencies
  useEffect(() => {
    if (!user) return;

    const fetchTasks = async () => {
      try {
        const { data: tasksData, error: tasksError } = await supabase
          .from("tasks")
          .select(`
            *,
            dependencies:task_dependencies(
              dependency_task_id
            )
          `)
          .eq("user_id", user.id);

        if (tasksError) throw tasksError;

        const formattedTasks: Task[] = tasksData.map(transformTaskData);
        setTasks(formattedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast({
          title: "Error",
          description: "Failed to fetch tasks",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('tasks-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  const addTask = useCallback(async (task: Omit<Task, "id" | "createdAt">) => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert([{ 
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          due_date: task.dueDate,
          user_id: user?.id 
        }])
        .select()
        .single();

      if (error) throw error;

      const newTask = transformTaskData(data);
      setTasks((prev) => [...prev, newTask]);
      
      toast({
        title: "Task created",
        description: "Your task has been created successfully.",
      });
    } catch (error) {
      console.error("Error adding task:", error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const updateTask = useCallback(async (updatedTask: Task) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          title: updatedTask.title,
          description: updatedTask.description,
          priority: updatedTask.priority,
          status: updatedTask.status,
          due_date: updatedTask.dueDate,
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
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  }, [toast]);

  const deleteTask = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id);

      if (error) throw error;

      setTasks((prev) => prev.filter((task) => task.id !== id));
      toast({
        title: "Task deleted",
        description: "Your task has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  }, [toast]);

  const moveTask = useCallback(async (taskId: string, newStatus: TaskStatus) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", taskId);

      if (error) throw error;

      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.error("Error moving task:", error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  }, [toast]);

  const addDependency = useCallback(async (taskId: string, dependencyId: string) => {
    try {
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
    } catch (error) {
      console.error("Error adding dependency:", error);
      toast({
        title: "Error",
        description: "Failed to add dependency",
        variant: "destructive",
      });
    }
  }, [toast]);

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
  }, [toast]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        moveTask,
        addDependency,
        removeDependency,
        loading,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
};
