import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Task,
  TaskPriority,
  TaskStatus,
  EventType,
  Attendee,
  RecurrencePattern,
  WeekDay,
  MonthlyRecurrenceType,
  Sensitivity,
  TaskTag,
} from "@/types/task";
import { Json } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { CategorySelect } from "./task-form/CategorySelect";
import { PrioritySelect } from "./task-form/PrioritySelect";
import { DatePicker } from "./task-form/DatePicker";
import { RecurrenceSettings } from "./task-form/RecurrenceSettings";
import { SubtaskList } from "./task-form/SubtaskList";
import { TagList } from "./task-form/TagList";
import { MeetingSettings } from "./task-form/MeetingSettings";
import { DependencySelect } from "./task-form/DependencySelect";
import { Repeat, ClipboardList, Video, UserPlus, Link2 } from "lucide-react";

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

interface DatabaseTask {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  due_date: string | null;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
  user_id: string;
  category_ids: string[] | null;
  tags: string[] | null;
  event_type: string | null;
  is_all_day: boolean | null;
  location: string | null;
  attendees: Json | null;
  recurrence_pattern: string | null;
  recurrence_interval: number | null;
  recurrence_start_date: string | null;
  recurrence_end_date: string | null;
  next_occurrence: string | null;
  last_occurrence: string | null;
  schedule_start_date: string | null;
  weekly_recurrence_days: string[] | null;
  monthly_recurrence_type: string | null;
  monthly_recurrence_day: number | null;
  reminder_minutes: number | null;
  online_meeting_url: string | null;
  sensitivity: string | null;
  goal_deadline: string | null;
  goal_target: string | null;
  habit_frequency: string | null;
  habit_streak: number | null;
  progress: number | null;
  is_completed: boolean | null;
}

interface Dependency {
  id: string;
  title: string;
}

export const TaskForm = ({ onSubmit, initialData, taskType, onCancel }: TaskFormProps) => {
  const [recurrenceEnabled, setRecurrenceEnabled] = useState(!!initialData?.recurrencePattern);
  const [subtasks, setSubtasks] = useState<Subtask[]>(initialData?.subtasks || []);
  const [isOnlineMeeting, setIsOnlineMeeting] = useState(true);
  const [tags, setTags] = useState<TaskTag[]>(initialData?.tags || []);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialData?.categoryIds || []);
  const [attendees, setAttendees] = useState<Attendee[]>(initialData?.attendees || []);
  const [locationInput, setLocationInput] = useState(initialData?.location || '');
  const [meetingUrl, setMeetingUrl] = useState(initialData?.onlineMeetingUrl || '');

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
        subtasks: [],
        dependencies: [],
        categoryIds: [],
        recurrencePattern: undefined as RecurrencePattern | undefined,
        recurrenceInterval: 1,
        recurrenceStartDate: undefined,
        recurrenceEndDate: undefined,
        weeklyRecurrenceDays: [] as WeekDay[],
        monthlyRecurrenceType: undefined as MonthlyRecurrenceType | undefined,
        monthlyRecurrenceDay: undefined,
        location: "",
        onlineMeetingUrl: "",
        attendees: [],
      },
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

  const transformDatabaseTask = (task: DatabaseTask): Task => ({
    id: task.id,
    title: task.title,
    description: task.description || "",
    priority: task.priority as TaskPriority,
    status: task.status as TaskStatus,
    dueDate: task.due_date || new Date().toISOString(),
    createdAt: task.created_at,
    dependencies: [],
    categoryIds: task.category_ids || [],
    subtasks: [],
    tags: [],
    eventType: (task.event_type || taskType) as EventType,
    startTime: task.start_time || undefined,
    endTime: task.end_time || undefined,
    isAllDay: task.is_all_day || false,
    location: task.location || undefined,
    attendees: ((task.attendees as any[] || []) as Array<{ email: string; required: boolean }>)
      .map(a => ({ email: a.email, required: a.required })),
    recurrencePattern: task.recurrence_pattern as RecurrencePattern || undefined,
    recurrenceInterval: task.recurrence_interval || 1,
    recurrenceStartDate: task.recurrence_start_date || undefined,
    recurrenceEndDate: task.recurrence_end_date || undefined,
    nextOccurrence: task.next_occurrence || undefined,
    lastOccurrence: task.last_occurrence || undefined,
    scheduleStartDate: task.schedule_start_date || undefined,
    weeklyRecurrenceDays: (task.weekly_recurrence_days as WeekDay[]) || [],
    monthlyRecurrenceType: (task.monthly_recurrence_type as MonthlyRecurrenceType) || undefined,
    monthlyRecurrenceDay: task.monthly_recurrence_day || undefined,
    reminderMinutes: task.reminder_minutes || 15,
    onlineMeetingUrl: task.online_meeting_url || undefined,
    sensitivity: (task.sensitivity || "normal") as Sensitivity,
  });

  const { data: allTasks = [] } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data: tasksData, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at');
      
      if (error) {
        toast({
          title: "Error fetching tasks",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      return (tasksData as unknown as DatabaseTask[]).map(transformDatabaseTask);
    },
  });

  const handleAddCategory = (categoryId: string) => {
    const newCategories = [...selectedCategories, categoryId];
    setSelectedCategories(newCategories);
    setValue("categoryIds", newCategories);
  };

  const handleRemoveCategory = (categoryId: string) => {
    const newCategories = selectedCategories.filter(id => id !== categoryId);
    setSelectedCategories(newCategories);
    setValue("categoryIds", newCategories);
  };

  const handleAddAttendee = (email: string) => {
    if (!email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    const newAttendee: Attendee = {
      email,
      required: true,
      response: 'tentative'
    };
    setAttendees([...attendees, newAttendee]);
  };

  const handleRemoveAttendee = (email: string) => {
    setAttendees(attendees.filter(a => a.email !== email));
  };

  const handleUpdateAttendeeResponse = (email: string, response: 'accepted' | 'tentative' | 'declined') => {
    setAttendees(attendees.map(a => 
      a.email === email ? { ...a, response } : a
    ));
  };

  const generateZoomLink = async () => {
    const mockZoomLink = `https://zoom.us/j/${Math.random().toString(36).substr(2, 9)}`;
    setMeetingUrl(mockZoomLink);
    setValue('onlineMeetingUrl', mockZoomLink);
  };

  const handleLocationTypeChange = (type: 'online' | 'inPerson') => {
    setIsOnlineMeeting(type === 'online');
    if (type === 'online') {
      setLocationInput('');
      setValue('location', '');
    } else {
      setMeetingUrl('');
      setValue('onlineMeetingUrl', '');
    }
  };

  const handleFormSubmit = async (data: any) => {
    const formData = {
      ...data,
      subtasks,
      tags: taskType === 'meeting' ? [] : tags,
      dependencies: watch('dependencies') || [],
      categoryIds: taskType === 'meeting' ? [] : selectedCategories,
      location: isOnlineMeeting ? meetingUrl : locationInput,
      attendees: taskType === 'meeting' ? attendees : [],
      isOnlineMeeting,
      onlineMeetingUrl: meetingUrl,
    };

    if (taskType === 'meeting' && attendees.length > 0) {
      try {
        await Promise.all(attendees.map(attendee => 
          fetch('/api/send-meeting-invitation', {
            method: 'POST',
            body: JSON.stringify({
              attendee,
              meeting: formData
            })
          })
        ));

        toast({
          title: "Meeting invitations sent",
          description: "All attendees have been notified",
        });
      } catch (error) {
        console.error('Error sending invitations:', error);
        toast({
          title: "Error",
          description: "Failed to send meeting invitations",
          variant: "destructive",
        });
      }
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {taskType === 'task' ? (
            <ClipboardList className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Video className="h-5 w-5 text-muted-foreground" />
          )}
          <Input
            {...register("title", { required: true })}
            placeholder={`${taskType} title`}
            className="text-lg"
          />
        </div>

        <Textarea
          {...register("description")}
          placeholder="Description"
          className="min-h-[100px]"
        />

        <div className="flex items-center gap-4">
          <div className="w-1/4 space-y-2">
            <Label>Priority</Label>
            <PrioritySelect
              defaultValue={initialData?.priority || "low"}
              onValueChange={(value: TaskPriority) => setValue("priority", value)}
            />
          </div>

          <div className="w-1/3 space-y-2">
            <Label>{taskType === 'meeting' ? 'Meeting Time' : 'Deadline'}</Label>
            <div className="flex items-center gap-2">
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
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={cn(
                  "h-9 w-9 rounded-md p-2",
                  recurrenceEnabled && "bg-primary/20 text-primary"
                )}
                onClick={() => setRecurrenceEnabled(!recurrenceEnabled)}
              >
                <Repeat className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {recurrenceEnabled && (
          <div className="bg-muted p-4 rounded-lg">
            <RecurrenceSettings
              enabled={recurrenceEnabled}
              onEnableChange={setRecurrenceEnabled}
              pattern={watch("recurrencePattern")}
              onPatternChange={(pattern) => setValue("recurrencePattern", pattern)}
              interval={watch("recurrenceInterval")}
              onIntervalChange={(interval) => setValue("recurrenceInterval", interval)}
              startDate={watch("recurrenceStartDate") ? new Date(watch("recurrenceStartDate")) : undefined}
              onStartDateChange={(date) => setValue("recurrenceStartDate", date?.toISOString())}
              endDate={watch("recurrenceEndDate") ? new Date(watch("recurrenceEndDate")) : undefined}
              onEndDateChange={(date) => setValue("recurrenceEndDate", date?.toISOString())}
              weeklyDays={watch("weeklyRecurrenceDays") || []}
              onWeeklyDaysChange={(days) => setValue("weeklyRecurrenceDays", days)}
              monthlyType={watch("monthlyRecurrenceType")}
              onMonthlyTypeChange={(type) => setValue("monthlyRecurrenceType", type)}
              monthlyDay={watch("monthlyRecurrenceDay") || 1}
              onMonthlyDayChange={(day) => setValue("monthlyRecurrenceDay", day)}
            />
          </div>
        )}

        {taskType !== 'meeting' && (
          <>
            <CategorySelect
              categories={categories}
              selectedCategories={selectedCategories}
              onAddCategory={handleAddCategory}
              onRemoveCategory={handleRemoveCategory}
              onOpenDialog={() => setCategoryDialogOpen(true)}
            />

            <div className="space-y-2">
              <TagList
                tags={tags}
                onAddTag={(tag) => setTags([...tags, tag])}
                onRemoveTag={(id) => setTags(tags.filter(t => t.id !== id))}
              />
            </div>
          </>
        )}

        <DependencySelect
          tasks={allTasks}
          selectedDependencies={watch("dependencies") || []}
          onDependencyChange={(dependencies) => setValue("dependencies", dependencies)}
          currentTaskId={initialData?.id}
          placeholder="Related Tasks (optional)"
        />

        {taskType === 'meeting' && (
          <>
            <div className="space-y-2">
              <div className="flex justify-center gap-2">
                <Button
                  type="button"
                  variant={isOnlineMeeting ? "default" : "outline"}
                  onClick={() => handleLocationTypeChange('online')}
                >
                  Online
                </Button>
                <Button
                  type="button"
                  variant={!isOnlineMeeting ? "default" : "outline"}
                  onClick={() => handleLocationTypeChange('inPerson')}
                >
                  In Person
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-muted-foreground" />
                <Input
                  value={isOnlineMeeting ? meetingUrl : locationInput}
                  onChange={(e) => {
                    if (isOnlineMeeting) {
                      setMeetingUrl(e.target.value);
                      setValue('onlineMeetingUrl', e.target.value);
                    } else {
                      setLocationInput(e.target.value);
                      setValue('location', e.target.value);
                    }
                  }}
                  placeholder={isOnlineMeeting ? "Meeting Link" : "Address"}
                  className="flex-1"
                />
                {isOnlineMeeting && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateZoomLink}
                  >
                    Zoom
                  </Button>
                )}
              </div>
            </div>

            <MeetingSettings
              attendees={attendees}
              isOnlineMeeting={isOnlineMeeting}
              onOnlineMeetingChange={(isOnline) => handleLocationTypeChange(isOnline ? 'online' : 'inPerson')}
              onLocationChange={(location) => {
                setLocationInput(location);
                setValue('location', location);
              }}
              onMeetingUrlChange={(url) => {
                setMeetingUrl(url || '');
                setValue('onlineMeetingUrl', url);
              }}
              onAddAttendee={handleAddAttendee}
              onRemoveAttendee={handleRemoveAttendee}
              onUpdateAttendeeResponse={handleUpdateAttendeeResponse}
              onDurationChange={(duration) => {
                const startTime = new Date(watch('startTime'));
                const endTime = new Date(startTime.getTime() + parseInt(duration) * 60000);
                setValue('endTime', endTime.toISOString());
              }}
            />
          </>
        )}

        {taskType === 'task' && (
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
