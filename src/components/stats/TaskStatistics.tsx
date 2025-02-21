
import React from "react";
import { useTaskContext } from "@/contexts/TaskContext";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, Target } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

export const TaskStatistics = () => {
  const { tasks } = useTaskContext();
  const now = new Date();
  const [activeIndex, setActiveIndex] = React.useState(0);

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

  const statsCards = [
    {
      title: "Weekly Completion Rate",
      value: `${weeklyCompletionRate}%`,
      description: "For the current week",
      icon: Clock,
    },
    {
      title: "Monthly Completion Rate",
      value: `${monthlyCompletionRate}%`,
      description: "For the current month",
      icon: Target,
    },
    {
      title: "Total Tasks Completed",
      value: `${completedTasks}/${totalTasks}`,
      description: "All time completion",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="w-full">
      {/* Desktop view */}
      <div className="hidden md:grid md:grid-cols-3 gap-4">
        {statsCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Mobile view with carousel */}
      <div className="md:hidden">
        <Carousel
          opts={{
            align: "start",
            containScroll: "trimSnaps",
            loop: true,
          }}
          className="w-full"
          onSelect={(api) => {
            setActiveIndex(api.selectedScrollSnap());
          }}
        >
          <CarouselContent className="-ml-4">
            {statsCards.map((stat, index) => (
              <CarouselItem key={index} className="pl-4 basis-[42%] min-w-0">
                <StatCard {...stat} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center gap-2 mt-4">
            {statsCards.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  activeIndex === index ? "bg-primary" : "bg-muted"
                )}
                onClick={() => {
                  const carousel = document.querySelector(".embla__container");
                  if (carousel) {
                    carousel.scrollTo({
                      left: index * (carousel.clientWidth / 2.25),
                      behavior: "smooth",
                    });
                  }
                }}
              />
            ))}
          </div>
        </Carousel>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, description, icon: Icon }) => (
  <Card className="h-[200px] flex flex-col">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent className="flex-1 flex flex-col justify-center">
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">
        {description}
      </p>
    </CardContent>
  </Card>
);
