import React, { useState, useMemo } from "react";
import { useTaskContext } from "@/contexts/TaskContext";
import { TaskCard } from "./TaskCard";
import { Task, TaskStatus, TaskPriority } from "@/types/task";
import { SearchAndFilter } from "./SearchAndFilter";
import { TaskDialog } from "./board/TaskDialog";
import { CategoryDialog } from "./board/CategoryDialog";
import { DroppableColumn } from "./board/DroppableColumn";
import { columns } from "./board/constants";
import { 
  DndContext, 
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { useFilter } from "@/hooks/useFilter";
import { startOfDay, startOfWeek, endOfWeek } from "date-fns";

export const TaskBoard = () => {
  const { tasks, addTask, updateTask, moveTask } = useTaskContext();
  const { currentFilter, getFilteredTaskCount } = useFilter();
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
        // First apply the sidebar filter
        if (currentFilter !== "all") {
          const taskDate = task.dueDate ? new Date(task.dueDate) : null;
          const today = startOfDay(new Date());
          const weekStart = startOfWeek(today);
          const weekEnd = endOfWeek(today);

          switch (currentFilter) {
            case "today":
              if (!taskDate || taskDate < today || taskDate >= new Date(today.getTime() + 24 * 60 * 60 * 1000)) {
                return false;
              }
              break;
            case "this-week":
              if (!taskDate || taskDate < weekStart || taskDate > weekEnd) {
                return false;
              }
              break;
            case "upcoming":
              if (!taskDate || taskDate <= weekEnd) {
                return false;
              }
              break;
          }
        }

        // Then apply the search and other filters
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
  }, [tasks, searchQuery, statusFilter, priorityFilter, sortBy, sortDirection, currentFilter]);

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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <TaskDialog
            isOpen={taskDialogOpen}
            onOpenChange={setTaskDialogOpen}
            selectedTask={selectedTask}
            onSubmit={handleTaskSubmit}
          />

          <CategoryDialog
            isOpen={categoryDialogOpen}
            onOpenChange={setCategoryDialogOpen}
          />
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
