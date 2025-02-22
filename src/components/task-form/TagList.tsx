
import React, { useState } from "react";
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
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      });
      setNewTag("");
    }
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Tag className="h-4 w-4" />
        Tags
      </Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <Badge
            key={tag.id}
            style={{ backgroundColor: `${tag.color}20`, borderColor: tag.color }}
            className="flex items-center gap-1"
          >
            {tag.name}
            <X
              className="h-3 w-3 cursor-pointer"
              onClick={() => onRemoveTag(tag.id)}
            />
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Add new tag"
          onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
        />
        <Button type="button" size="icon" onClick={handleAddTag}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
