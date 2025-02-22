
import React, { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tag, Plus, X } from "lucide-react";

interface TaskTag {
  id: string;
  name: string;
  color: string;
}

interface TagListProps {
  tags: TaskTag[];
  onAddTag: (tag: TaskTag) => void;
  onRemoveTag: (id: string) => void;
}

export const TagList = ({ tags, onAddTag, onRemoveTag }: TagListProps) => {
  const [newTag, setNewTag] = useState("");

  const handleAddTag = () => {
    if (newTag.trim()) {
      onAddTag({
        id: Date.now().toString(),
        name: newTag.trim(),
        color: generateTagColor(),
      });
      setNewTag("");
    }
  };

  const generateTagColor = () => {
    const colors = [
      "#8B5CF6", // Vivid Purple
      "#0EA5E9", // Ocean Blue
      "#F97316", // Bright Orange
      "#D946EF", // Magenta Pink
      "#1EAEDB", // Bright Blue
      "#9b87f5", // Primary Purple
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Add new tag"
          className="h-9 text-sm flex-1"
          onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddTag();
            }
          }}
        />
        <Button 
          type="button" 
          size="icon" 
          className="h-9 w-9"
          onClick={handleAddTag}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="flex items-center gap-1.5 py-1 pl-2 pr-1.5 text-xs bg-blue-50/50 border-blue-200 text-blue-700 hover:bg-blue-100/50 dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors"
            >
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              {tag.name}
              <button
                type="button"
                onClick={() => onRemoveTag(tag.id)}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
