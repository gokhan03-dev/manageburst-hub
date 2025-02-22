
import React from "react";
import { DependencySelect } from "../DependencySelect";
import { Task } from "@/types/task";

interface TaskDependenciesProps {
  tasks: Task[];
  selectedDependencies: string[];
  onDependencyChange: (dependencies: string[]) => void;
}

export const TaskDependencies = ({
  tasks,
  selectedDependencies,
  onDependencyChange,
}: TaskDependenciesProps) => {
  return (
    <div className="space-y-2">
      <DependencySelect
        tasks={tasks}
        selectedDependencies={selectedDependencies}
        onDependencyChange={onDependencyChange}
      />
    </div>
  );
};
