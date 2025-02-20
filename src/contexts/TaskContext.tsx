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
  checkDependenciesCompleted: (taskId: string) => Promise<boolean>;
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
        // First fetch tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from("tasks")
          .select("*")
          .eq("user_id", user.id);

        if (tasksError) throw tasksError;

        // Then fetch dependencies for these tasks
        const { data: dependenciesData, error: dependenciesError } = await supabase
          .from("task_dependencies")
          .select("dependent_task_id, dependency_task_id")
          .in("dependent_task_id", tasksData.map(t => t.id));

        if (dependenciesError) throw dependenciesError;

        // Map dependencies to tasks
        const formattedTasks = tasksData.map(task => ({
          ...transformTaskData(task),
          dependencies: dependenciesData
            ?.filter(dep => dep.dependent_task_id === task.id)
            .map(dep => dep.dependency_task_id) || []
        }));

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

      // Add dependencies if any
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
  }, [user, toast]);

  const updateTask = useCallback(async (updatedTask: Task) => {
    try {
      // Check dependencies if moving to completed
      if (updatedTask.status === "completed") {
        const depsCompleted = await checkDependenciesCompleted(updatedTask.id);
        if (!depsCompleted) {
          throw new Error("Cannot complete task: dependencies are not completed");
        }
      }

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
    } catch (error: any) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [toast, checkDependenciesCompleted]);

  const deleteTask = useCallback(async (id: string) => {
    try {
      // Check if task has dependent tasks
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
      // Validate due dates
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
  }, [tasks, toast]);

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
