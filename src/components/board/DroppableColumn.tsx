
import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { TaskStatus } from "@/types/task";

interface DroppableColumnProps {
  column: {
    id: TaskStatus;
    title: string;
  };
  children: React.ReactNode;
}

export const DroppableColumn = ({ column, children }: DroppableColumnProps) => {
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
