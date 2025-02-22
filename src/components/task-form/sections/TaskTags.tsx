
import React from "react";
import { TagList } from "../TagList";
import { TaskTag } from "@/types/task";

interface TaskTagsProps {
  tags: TaskTag[];
  setTags: (tags: TaskTag[]) => void;
}

export const TaskTags = ({ tags, setTags }: TaskTagsProps) => {
  return (
    <div className="space-y-2">
      <TagList
        tags={tags}
        onAddTag={(tag) => setTags([...tags, tag])}
        onRemoveTag={(id) => setTags(tags.filter(t => t.id !== id))}
      />
    </div>
  );
};
