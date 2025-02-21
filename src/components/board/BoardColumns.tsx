
import React from "react";
import { Task, TaskStatus } from "@/types/task";
import { DroppableColumn } from "./DroppableColumn";
import { TaskCard } from "../TaskCard";
import { columns } from "./constants";
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";

interface BoardColumnsProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDragEnd: (event: DragEndEvent) => void;
}

export const BoardColumns = ({ tasks, onTaskClick, onDragEnd }: BoardColumnsProps) => {
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

  return (
    <DndContext 
      sensors={sensors}
      modifiers={[restrictToWindowEdges]}
      onDragEnd={onDragEnd}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 pb-24 lg:pb-0">
        {columns.map((column) => (
          <DroppableColumn key={column.id} column={column}>
            {tasks
              .filter((task) => task.status === column.id)
              .map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => onTaskClick(task)}
                  className="animate-fade-in"
                />
              ))}
          </DroppableColumn>
        ))}
      </div>
    </DndContext>
  );
};
