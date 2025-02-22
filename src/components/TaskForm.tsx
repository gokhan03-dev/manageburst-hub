import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Task,
  TaskPriority,
  TaskStatus,
  EventType,
  Attendee,
} from "@/types/task";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useTaskContext } from "@/contexts/TaskContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { DependencySelect } from "./task-form/DependencySelect";
import { CategorySelect } from "./task-form/CategorySelect";
import { PrioritySelect } from "./task-form/PrioritySelect";
import { DatePicker } from "./task-form/DatePicker";
import { RecurrenceSettings } from "./task-form/RecurrenceSettings";
import { Repeat, Bell, Plus, X, Settings, Tag, Link2, Users, CheckCircle2, Circle } from "lucide-react";
import { TaskAttendees } from "./calendar/TaskAttendees";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface TaskFormProps {
  onSubmit: (data: Omit<Task, "id" | "createdAt">) => void;
  initialData?: Task;
  taskType: EventType;
  onCancel: () => void;
}

interface Subtask {
  text: string;
  completed: boolean;
}

interface TaskTag {
  id: string;
  name: string;
  color: string;
}

export const TaskForm = ({ onSubmit, initialData, taskType, onCancel }: TaskFormProps) => {
  const [recurrenceEnabled, setRecurrenceEnabled] = useState(!!initialData?.recurrencePattern);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [isOnlineMeeting, setIsOnlineMeeting] = useState(true);
  const [tags, setTags] = useState<TaskTag[]>([]);
  const [newTag, setNewTag] = useState("");

  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      ...initialData || {
        title: "",
        description: "",
        priority: "low" as TaskPriority,
        status: "todo" as TaskStatus,
        dueDate: new Date().toISOString(),
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 30 * 60000).toISOString(),
      },
      reminderMinutes: taskType === 'meeting' ? 15 : undefined,
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) {
        toast({
          title: "Error fetching categories",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      return data;
    },
  });

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, { text: newSubtask.trim(), completed: false }]);
      setNewSubtask("");
    }
  };

  const toggleSubtask = (index: number) => {
    setSubtasks(subtasks.map((subtask, i) => 
      i === index ? { ...subtask, completed: !subtask.completed } : subtask
    ));
  };

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      const newTagObj = {
        id: Date.now().toString(),
        name: newTag.trim(),
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      };
      setTags([...tags, newTagObj]);
      setNewTag("");
    }
  };

  const handleMeetingDurationChange = (duration: string) => {
    const startDate = new Date(watch("startTime"));
    const endDate = new Date(startDate.getTime() + parseInt(duration) * 60000);
    setValue("endTime", endDate.toISOString());
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <Input
          {...register("title", { required: true })}
          placeholder={`${taskType} title`}
          className="text-lg"
        />

        <Textarea
          {...register("description")}
          placeholder="Description"
          className="min-h-[100px]"
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Priority</Label>
            <div className="flex items-center space-x-2">
              <Circle 
                className={cn(
                  "h-3 w-3",
                  watch("priority") === "low" && "text-blue-500",
                  watch("priority") === "medium" && "text-yellow-500",
                  watch("priority") === "high" && "text-red-500"
                )} 
              />
              <PrioritySelect
                defaultValue={initialData?.priority || "low"}
                onValueChange={(value: TaskPriority) => setValue("priority", value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{taskType === 'meeting' ? 'Meeting Time' : 'Deadline'}</Label>
            <DatePicker
              date={initialData?.dueDate ? new Date(initialData.dueDate) : undefined}
              onSelect={(date) => {
                if (taskType === 'meeting') {
                  setValue("startTime", date?.toISOString());
                  if (date) {
                    const endDate = new Date(date.getTime() + 30 * 60000);
                    setValue("endTime", endDate.toISOString());
                  }
                } else {
                  setValue("dueDate", date?.toISOString());
                }
              }}
              showTimePicker={taskType === 'meeting'}
            />
          </div>
        </div>

        {taskType === 'meeting' && (
          <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
            <div>
              <Label>Duration</Label>
              <Select 
                defaultValue="30"
                onValueChange={handleMeetingDurationChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Attendees
              </Label>
              <TaskAttendees
                attendees={initialData?.attendees || []}
                onAddAttendee={() => {}}
                onRemoveAttendee={() => {}}
                onUpdateAttendeeResponse={() => {}}
              />
            </div>

            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant={isOnlineMeeting ? "default" : "outline"}
                onClick={() => {
                  setIsOnlineMeeting(true);
                  setValue("location", "online");
                }}
                className="flex-1"
              >
                <Link2 className="h-4 w-4 mr-2" />
                Online
              </Button>
              <Button
                type="button"
                variant={!isOnlineMeeting ? "default" : "outline"}
                onClick={() => {
                  setIsOnlineMeeting(false);
                  setValue("location", "");
                  setValue("onlineMeetingUrl", undefined);
                }}
                className="flex-1"
              >
                <Users className="h-4 w-4 mr-2" />
                In Person
              </Button>
            </div>

            {isOnlineMeeting && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Zoom meeting link will be generated</p>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn("gap-2", recurrenceEnabled && "text-primary")}
            onClick={() => setRecurrenceEnabled(!recurrenceEnabled)}
          >
            <Repeat className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn("gap-2", reminderEnabled && "text-primary")}
            onClick={() => setReminderEnabled(!reminderEnabled)}
          >
            <Bell className="h-4 w-4" />
          </Button>
        </div>

        {recurrenceEnabled && (
          <div className="bg-muted p-4 rounded-lg">
            <RecurrenceSettings
              enabled={recurrenceEnabled}
              onEnableChange={setRecurrenceEnabled}
              pattern={initialData?.recurrencePattern}
              onPatternChange={(pattern) => setValue("recurrencePattern", pattern)}
              interval={initialData?.recurrenceInterval}
              onIntervalChange={(interval) => setValue("recurrenceInterval", interval)}
              startDate={initialData?.recurrenceStartDate ? new Date(initialData.recurrenceStartDate) : undefined}
              onStartDateChange={(date) => setValue("recurrenceStartDate", date?.toISOString())}
              endDate={initialData?.recurrenceEndDate ? new Date(initialData.recurrenceEndDate) : undefined}
              onEndDateChange={(date) => setValue("recurrenceEndDate", date?.toISOString())}
            />
          </div>
        )}

        {reminderEnabled && (
          <div className="bg-muted p-4 rounded-lg">
            <Select 
              defaultValue={taskType === 'meeting' ? "15" : undefined}
              onValueChange={(value) => setValue("reminderMinutes", parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select reminder time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 minutes before</SelectItem>
                <SelectItem value="15">15 minutes before</SelectItem>
                <SelectItem value="30">30 minutes before</SelectItem>
                <SelectItem value="60">1 hour before</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Categories</Label>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          <CategorySelect
            categories={categories}
            selectedCategories={initialData?.categoryIds || []}
            onAddCategory={(categoryId) => {
              const currentCategories = watch("categoryIds") || [];
              setValue("categoryIds", [...currentCategories, categoryId]);
            }}
            onRemoveCategory={(categoryId) => {
              const currentCategories = watch("categoryIds") || [];
              setValue(
                "categoryIds",
                currentCategories.filter((id) => id !== categoryId)
              );
            }}
          />
        </div>

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
                  onClick={() => setTags(tags.filter(t => t.id !== tag.id))}
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

        {taskType === 'task' && (
          <div className="space-y-2">
            <Label>Subtasks</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Add subtask"
                  onKeyPress={(e) => e.key === "Enter" && handleAddSubtask()}
                />
                <Button type="button" size="icon" onClick={handleAddSubtask}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {subtasks.map((subtask, index) => (
                <div key={index} className="flex items-center gap-2 bg-muted p-2 rounded">
                  <Checkbox
                    checked={subtask.completed}
                    onCheckedChange={() => toggleSubtask(index)}
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
                    onClick={() => removeSubtask(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? "Update" : "Create"} {taskType}
        </Button>
      </div>
    </form>
  );
};
