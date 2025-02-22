
import React from "react";
import { SubtaskList } from "../SubtaskList";

interface Subtask {
  text: string;
  completed: boolean;
}

interface TaskSubtasksProps {
  subtasks: Subtask[];
  setSubtasks: (subtasks: Subtask[]) => void;
}

export const TaskSubtasks = ({ subtasks, setSubtasks }: TaskSubtasksProps) => {
  return (
    <div className="space-y-2">
      <SubtaskList
        subtasks={subtasks}
        onAddSubtask={(text) => setSubtasks([...subtasks, { text, completed: false }])}
        onToggleSubtask={(index) => setSubtasks(subtasks.map((subtask, i) => 
          i === index ? { ...subtask, completed: !subtask.completed } : subtask
        ))}
        onRemoveSubtask={(index) => setSubtasks(subtasks.filter((_, i) => i !== index))}
      />
    </div>
  );
};
