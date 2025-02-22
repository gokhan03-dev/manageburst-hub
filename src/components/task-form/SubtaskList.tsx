
import React, { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  subtasks,
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
      <Label className="flex items-center gap-2">
        <ListTodo className="h-4 w-4" />
        Subtasks
      </Label>
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            placeholder="Add subtask"
            onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddSubtask();
              }
            }}
          />
          <Button type="button" size="icon" onClick={handleAddSubtask}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {subtasks.map((subtask, index) => (
          <div key={index} className="flex items-center gap-2 bg-muted p-2 rounded">
            <Checkbox
              checked={subtask.completed}
              onCheckedChange={() => onToggleSubtask(index)}
              className="h-4 w-4"
            />
            <span className={cn(
              "flex-1",
              subtask.completed && "line-through text-muted-foreground"
            )}>
              {subtask.text}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
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
