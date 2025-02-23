
import React, { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";

interface Subtask {
  text: string;
  completed: boolean;
}

interface SubtaskListProps {
  subtasks: Subtask[];
  onAddSubtask: (text: string) => void;
  onToggleSubtask: (index: number) => void;
  onRemoveSubtask: (index: number) => void;
}

export const SubtaskList = ({
  subtasks = [],
  onAddSubtask,
  onToggleSubtask,
  onRemoveSubtask,
}: SubtaskListProps) => {
  const [newSubtask, setNewSubtask] = useState("");

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      onAddSubtask(newSubtask.trim());
      setNewSubtask("");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <ListTodo className="h-4 w-4 text-muted-foreground" />
        <Input
          value={newSubtask}
          onChange={(e) => setNewSubtask(e.target.value)}
          placeholder="Add subtask"
          className="h-9 text-sm flex-1"
          onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddSubtask();
            }
          }}
        />
        <Button type="button" size="icon" className="h-9 w-9" onClick={handleAddSubtask}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2">
        {subtasks.map((subtask, index) => (
          <div key={index} className="flex items-center gap-2 bg-muted p-2 rounded">
            <Checkbox
              checked={subtask.completed}
              onCheckedChange={() => onToggleSubtask(index)}
              className="h-4 w-4"
            />
            <span className={cn(
              "flex-1 text-sm",
              subtask.completed && "line-through text-muted-foreground"
            )}>
              {subtask.text}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-background/50"
              onClick={() => onRemoveSubtask(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
