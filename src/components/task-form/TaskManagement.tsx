
import React from "react";
import { TaskTag, Subtask } from "@/types/task";
import { TagList } from "./TagList";
import { SubtaskList } from "./SubtaskList";

interface TaskManagementProps {
  tags?: TaskTag[];
  subtasks?: Subtask[];
  onAddTag?: (tag: TaskTag) => void;
  onRemoveTag?: (id: string) => void;
  onAddSubtask?: (text: string) => void;
  onToggleSubtask?: (index: number) => void;
  onRemoveSubtask?: (index: number) => void;
  onAddCategory?: (categoryId: string) => void;
  selectedCategoryIds?: string[];
}

export const TaskManagement = ({
  tags = [],
  subtasks = [],
  onAddTag = () => {},
  onRemoveTag = () => {},
  onAddSubtask = () => {},
  onToggleSubtask = () => {},
  onRemoveSubtask = () => {},
  onAddCategory = () => {},
  selectedCategoryIds = [],
}: TaskManagementProps) => {
  return (
    <>
      <TagList
        tags={tags}
        onAddTag={onAddTag}
        onRemoveTag={onRemoveTag}
      />

      <SubtaskList
        subtasks={subtasks}
        onAddSubtask={onAddSubtask}
        onToggleSubtask={onToggleSubtask}
        onRemoveSubtask={onRemoveSubtask}
      />
    </>
  );
};
