
import React, { useState, useMemo } from "react";
import { useTaskContext } from "@/contexts/TaskContext";
import { TaskCard } from "./TaskCard";
import { TaskForm } from "./TaskForm";
import { CategoryManager } from "./CategoryManager";
import { Task, TaskStatus, TaskPriority } from "@/types/task";
import { Plus, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchAndFilter } from "./SearchAndFilter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  DndContext, 
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";

const columns: { id: TaskStatus; title: string }[] = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "completed", title: "Completed" },
];

export const TaskBoard = () => {
  const { tasks, addTask, updateTask, moveTask } = useTaskContext();
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");
  const [sortBy, setSortBy] = useState("dueDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 300,
        tolerance: 8,
      },
    })
  );

  const filteredAndSortedTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const matchesSearch = searchQuery
          ? task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchQuery.toLowerCase())
          : true;
        const matchesStatus = statusFilter === "all" ? true : task.status === statusFilter;
        const matchesPriority = priorityFilter === "all" ? true : task.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case "dueDate":
            comparison = new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime();
            break;
          case "priority": {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            comparison = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
            break;
          }
          case "title":
            comparison = a.title.localeCompare(b.title);
            break;
          case "createdAt":
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
          default:
            comparison = 0;
        }
        return sortDirection === "asc" ? comparison : -comparison;
      });
  }, [tasks, searchQuery, statusFilter, priorityFilter, sortBy, sortDirection]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    try {
      await moveTask(taskId, newStatus);
    } catch (error) {
      console.error('Error moving task:', error);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
  };

  const handleTaskSubmit = (data: Omit<Task, "id" | "createdAt">) => {
    if (selectedTask) {
      updateTask({ ...data, id: selectedTask.id, createdAt: selectedTask.createdAt });
    } else {
      addTask(data);
    }
    setTaskDialogOpen(false);
    setSelectedTask(undefined);
  };

  const DroppableColumn = ({ column, children }: { column: typeof columns[0], children: React.ReactNode }) => {
    const { setNodeRef } = useDroppable({
      id: column.id,
    });

    return (
      <div
        ref={setNodeRef}
        className="rounded-lg border bg-white p-4 shadow-sm min-h-[200px]"
      >
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          {column.title}
        </h2>
        <div className="space-y-4">
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedTask ? "Edit Task" : "Create New Task"}
                </DialogTitle>
                <DialogDescription>
                  Fill in the details for your task below.
                </DialogDescription>
              </DialogHeader>
              <TaskForm
                onSubmit={handleTaskSubmit}
                initialData={selectedTask}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Tags className="h-4 w-4" />
                Manage Categories
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Manage Categories</DialogTitle>
                <DialogDescription>
                  Create and manage categories for your tasks.
                </DialogDescription>
              </DialogHeader>
              <CategoryManager />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <SearchAndFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortChange={setSortBy}
        onSortDirectionChange={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
      />

      <DndContext 
        sensors={sensors}
        modifiers={[restrictToWindowEdges]}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {columns.map((column) => (
            <DroppableColumn key={column.id} column={column}>
              {filteredAndSortedTasks
                .filter((task) => task.status === column.id)
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => handleTaskClick(task)}
                    className="animate-fade-in"
                  />
                ))}
            </DroppableColumn>
          ))}
        </div>
      </DndContext>
    </div>
  );
};
