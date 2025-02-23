
import React, { useState } from "react";
import { useTaskContext } from "@/contexts/TaskContext";
import { Task, TaskStatus, TaskPriority } from "@/types/task";
import { SearchAndFilter } from "./SearchAndFilter";
import { BoardActions } from "./board/BoardActions";
import { BoardColumns } from "./board/BoardColumns";
import { useTaskFiltering } from "@/hooks/useTaskFiltering";
import { useFilter } from "@/contexts/FilterContext";
import { DragEndEvent } from "@dnd-kit/core";

export const TaskBoard = () => {
  const { tasks, addTask, updateTask, moveTask } = useTaskContext();
  const { currentFilter } = useFilter();
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [selectedMeeting, setSelectedMeeting] = useState<Task | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");
  const [sortBy, setSortBy] = useState("dueDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const filteredAndSortedTasks = useTaskFiltering({
    tasks,
    searchQuery,
    statusFilter,
    priorityFilter,
    sortBy,
    sortDirection,
    currentFilter,
  });

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
    // Reset both selected states first
    setSelectedTask(undefined);
    setSelectedMeeting(undefined);

    // Then set the appropriate state and open the correct dialog
    if (task.eventType === "meeting") {
      setSelectedMeeting(task);
      setMeetingDialogOpen(true);
    } else {
      setSelectedTask(task);
      setTaskDialogOpen(true);
    }
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

  const handleMeetingSubmit = (data: Omit<Task, "id" | "createdAt">) => {
    if (selectedMeeting) {
      updateTask({ ...data, id: selectedMeeting.id, createdAt: selectedMeeting.createdAt });
    } else {
      addTask(data);
    }
    setMeetingDialogOpen(false);
    setSelectedMeeting(undefined);
  };

  return (
    <div className="space-y-2">
      <BoardActions
        onAddTask={() => {
          setSelectedTask(undefined);
          setTaskDialogOpen(true);
        }}
        taskDialogOpen={taskDialogOpen}
        setTaskDialogOpen={setTaskDialogOpen}
        selectedTask={selectedTask}
        onTaskSubmit={handleTaskSubmit}
        meetingDialogOpen={meetingDialogOpen}
        setMeetingDialogOpen={setMeetingDialogOpen}
        selectedMeeting={selectedMeeting}
        onMeetingSubmit={handleMeetingSubmit}
      />

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

      <BoardColumns
        tasks={filteredAndSortedTasks}
        onTaskClick={handleTaskClick}
        onDragEnd={handleDragEnd}
      />
    </div>
  );
};
