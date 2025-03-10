
import React, { useState } from "react";
import { useTaskContext } from "@/contexts/TaskContext";
import { Task, TaskStatus, TaskPriority } from "@/types/task";
import { SearchAndFilter } from "./SearchAndFilter";
import { BoardActions } from "./board/BoardActions";
import { BoardColumns } from "./board/BoardColumns";
import { useTaskFiltering } from "@/hooks/useTaskFiltering";
import { useFilter } from "@/contexts/FilterContext";
import { DragEndEvent } from "@dnd-kit/core";
import { TaskDialog } from "./board/TaskDialog";
import { MeetingDialog } from "./meeting/MeetingDialog";
import { toast } from "@/hooks/use-toast";

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
    if (task.eventType === "meeting") {
      setSelectedTask(undefined);
      setSelectedMeeting(task);
      setMeetingDialogOpen(true);
    } else {
      setSelectedMeeting(undefined);
      setSelectedTask(task);
      setTaskDialogOpen(true);
    }
  };

  const handleTaskSubmit = (data: Omit<Task, "id" | "createdAt">) => {
    try {
      if (selectedTask) {
        updateTask({ ...data, id: selectedTask.id, createdAt: selectedTask.createdAt });
        toast({
          title: "Task updated",
          description: "Your task has been updated successfully.",
        });
      } else {
        addTask({ ...data, eventType: "task" });
        toast({
          title: "Task created",
          description: "Your task has been created successfully.",
        });
      }
      setTaskDialogOpen(false);
      setSelectedTask(undefined);
    } catch (error) {
      console.error("Error submitting task:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your task.",
        variant: "destructive",
      });
    }
  };

  const handleMeetingSubmit = (data: Omit<Task, "id" | "createdAt">) => {
    try {
      if (selectedMeeting) {
        updateTask({
          ...data,
          id: selectedMeeting.id,
          createdAt: selectedMeeting.createdAt,
          eventType: "meeting"
        });
        toast({
          title: "Meeting updated",
          description: "Your meeting has been updated successfully.",
        });
      } else {
        addTask({
          ...data,
          eventType: "meeting"
        });
        toast({
          title: "Meeting created",
          description: "Your meeting has been created successfully.",
        });
      }
      setMeetingDialogOpen(false);
      setSelectedMeeting(undefined);
    } catch (error) {
      console.error("Error submitting meeting:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your meeting.",
        variant: "destructive",
      });
    }
  };

  const handleAddMeeting = () => {
    setSelectedMeeting(undefined);
    setMeetingDialogOpen(true);
  };

  const handleAddTask = () => {
    setSelectedTask(undefined);
    setTaskDialogOpen(true);
  };

  return (
    <div className="space-y-2">
      <BoardActions
        onAddTask={handleAddTask}
        onAddMeeting={handleAddMeeting}
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

      <TaskDialog
        isOpen={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        selectedTask={selectedTask}
        onSubmit={handleTaskSubmit}
      />

      <MeetingDialog
        isOpen={meetingDialogOpen}
        onOpenChange={setMeetingDialogOpen}
        selectedMeeting={selectedMeeting}
        onSubmit={handleMeetingSubmit}
      />
    </div>
  );
};
