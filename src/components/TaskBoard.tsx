
import React, { useState } from "react";
import { useTaskContext } from "@/contexts/TaskContext";
import { TaskCard } from "./TaskCard";
import { TaskForm } from "./TaskForm";
import { Task, TaskStatus } from "@/types/task";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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

// Updated to match exact database values
const columns: { id: TaskStatus; title: string }[] = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "completed", title: "Completed" },
];

export const TaskBoard = () => {
  const { tasks, addTask, updateTask, moveTask } = useTaskContext();
  const [open, setOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    // Add logging to debug status values
    console.log('Moving task:', { taskId, newStatus });

    try {
      await moveTask(taskId, newStatus);
    } catch (error) {
      console.error('Error moving task:', error);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setOpen(true);
  };

  const handleSubmit = (data: Omit<Task, "id" | "createdAt">) => {
    if (selectedTask) {
      updateTask({ ...data, id: selectedTask.id, createdAt: selectedTask.createdAt });
    } else {
      addTask(data);
    }
    setOpen(false);
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
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
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
            </DialogHeader>
            <TaskForm
              onSubmit={handleSubmit}
              initialData={selectedTask}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DndContext 
        sensors={sensors}
        modifiers={[restrictToWindowEdges]}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {columns.map((column) => (
            <DroppableColumn key={column.id} column={column}>
              {tasks
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
