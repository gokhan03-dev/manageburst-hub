
import React from "react";
import { useTaskContext } from "@/contexts/TaskContext";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, Target } from "lucide-react";

export const TaskStatistics = () => {
  const { tasks } = useTaskContext();
  const now = new Date();

  const weekInterval = {
    start: startOfWeek(now),
    end: endOfWeek(now),
  };

  const monthInterval = {
    start: startOfMonth(now),
    end: endOfMonth(now),
  };

  const getCompletionRate = (tasks: any[], interval: { start: Date; end: Date }) => {
    const tasksInPeriod = tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return isWithinInterval(taskDate, interval);
    });

    if (tasksInPeriod.length === 0) return 0;

    const completedTasks = tasksInPeriod.filter(task => task.status === "completed");
    return Math.round((completedTasks.length / tasksInPeriod.length) * 100);
  };

  const weeklyCompletionRate = getCompletionRate(tasks, weekInterval);
  const monthlyCompletionRate = getCompletionRate(tasks, monthInterval);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === "completed").length;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Weekly Completion Rate</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{weeklyCompletionRate}%</div>
          <p className="text-xs text-muted-foreground">
            For the current week
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Completion Rate</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{monthlyCompletionRate}%</div>
          <p className="text-xs text-muted-foreground">
            For the current month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tasks Completed</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedTasks}/{totalTasks}</div>
          <p className="text-xs text-muted-foreground">
            All time completion
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
