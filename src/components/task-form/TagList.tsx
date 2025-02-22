
import React, { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    // List of high-contrast, readable colors
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
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-xs">
        <Tag className="h-3 w-3" />
        Tags
      </Label>
      <div className="space-y-1.5">
        <div className="flex gap-1.5 mb-1.5">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add new tag"
            className="h-7 text-xs"
            onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
          <Button type="button" size="icon" className="h-7 w-7" onClick={handleAddTag}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="flex items-center gap-1 px-1.5 py-0.5 text-xs"
              style={{
                backgroundColor: `${tag.color}15`,
                borderColor: tag.color,
                color: tag.color,
              }}
            >
              {tag.name}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => onRemoveTag(tag.id)}
              />
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};
