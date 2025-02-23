
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Task, TaskStatus } from "@/types/task";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { transformTaskData } from "@/utils/taskTransforms";
import { useTaskOperations } from "@/hooks/useTaskOperations";
import { useTaskDependencies } from "@/hooks/useTaskDependencies";
import { useToast } from "@/components/ui/use-toast";

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "createdAt">) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  addDependency: (taskId: string, dependencyId: string) => Promise<void>;
  removeDependency: (taskId: string, dependencyId: string) => Promise<void>;
  checkDependenciesCompleted: (taskId: string) => Promise<boolean>;
  loading: boolean;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const { addTask, updateTask, deleteTask, checkDependenciesCompleted } = useTaskOperations(tasks, setTasks, user?.id);
  const { addDependency, removeDependency } = useTaskDependencies(tasks, setTasks);

  useEffect(() => {
    if (!user) return;

    const fetchTasks = async () => {
      try {
        const { data: tasksData, error: tasksError } = await supabase
          .from("tasks")
          .select("*")
          .eq("user_id", user.id);

        if (tasksError) throw tasksError;

        const { data: dependenciesData, error: dependenciesError } = await supabase
          .from("task_dependencies")
          .select("dependent_task_id, dependency_task_id")
          .in("dependent_task_id", tasksData.map(t => t.id));

        if (dependenciesError) throw dependenciesError;

        console.log('Raw task data:', tasksData); // Debug log

        const formattedTasks = tasksData.map(task => ({
          ...transformTaskData(task),
          dependencies: dependenciesData
            ?.filter(dep => dep.dependent_task_id === task.id)
            .map(dep => dep.dependency_task_id) || []
        }));

        console.log('Formatted tasks:', formattedTasks); // Debug log

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
        checkDependenciesCompleted,
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
