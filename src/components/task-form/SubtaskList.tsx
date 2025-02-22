
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
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-xs">
        <ListTodo className="h-3 w-3" />
        Subtasks
      </Label>
      <div className="space-y-1.5">
        <div className="flex gap-1.5">
          <Input
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            placeholder="Add subtask"
            className="h-7 text-xs"
            onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddSubtask();
              }
            }}
          />
          <Button type="button" size="icon" className="h-7 w-7" onClick={handleAddSubtask}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        {subtasks.map((subtask, index) => (
          <div key={index} className="flex items-center gap-1.5 bg-muted p-1.5 rounded">
            <Checkbox
              checked={subtask.completed}
              onCheckedChange={() => onToggleSubtask(index)}
              className="h-3 w-3"
            />
            <span className={cn(
              "flex-1 text-xs",
              subtask.completed && "line-through text-muted-foreground"
            )}>
              {subtask.text}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-5 w-5 hover:bg-background/50 p-0"
              onClick={() => onRemoveSubtask(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
