
import React from "react";
import { useTaskContext } from "@/contexts/TaskContext";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Clock, Target } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { ProgressBar } from "./ProgressBar";

export const TaskStatistics = () => {
  const { tasks } = useTaskContext();
  const now = new Date();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [api, setApi] = React.useState<CarouselApi>();

  React.useEffect(() => {
    if (!api) return;
    api.on("select", () => setActiveIndex(api.selectedScrollSnap()));
  }, [api]);

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
  const completedTasks = tasks.filter(task => task.status === "completed").length;
  const totalTasks = tasks.length;

  const statsCards = [
    {
      titleLine1: "Weekly",
      titleLine2: "Progress",
      value: `${weeklyCompletionRate}%`,
      progress: weeklyCompletionRate,
      icon: Clock,
    },
    {
      titleLine1: "Monthly",
      titleLine2: "Progress",
      value: `${monthlyCompletionRate}%`,
      progress: monthlyCompletionRate,
      icon: Target,
    },
    {
      titleLine1: "Overall",
      titleLine2: "Tasks",
      value: `${completedTasks}/${totalTasks}`,
      progress: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="w-full">
      {/* Desktop view */}
      <div className="hidden md:grid md:grid-cols-3 gap-2">
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
            dragFree: true,
          }}
          className="w-full"
          setApi={setApi}
        >
          <CarouselContent className="-ml-2">
            {statsCards.map((stat, index) => (
              <CarouselItem key={index} className="pl-2 basis-[44%] min-w-0">
                <StatCard {...stat} isMobile />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center gap-1.5 mt-4 mb-2">
            {statsCards.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all",
                  activeIndex === index ? "bg-primary" : "bg-muted"
                )}
                onClick={() => api?.scrollTo(index)}
              />
            ))}
          </div>
        </Carousel>
      </div>
    </div>
  );
};

interface StatCardProps {
  titleLine1: string;
  titleLine2: string;
  value: string;
  progress: number;
  icon: React.ElementType;
  isMobile?: boolean;
}

const StatCard = ({ titleLine1, titleLine2, value, progress, icon: Icon, isMobile }: StatCardProps) => (
  <Card 
    className={cn(
      "flex flex-col transition-all duration-200 ease-out",
      "bg-card border-none",
      "shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]",
      "dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]",
      "dark:bg-card/80 dark:backdrop-blur-sm dark:border dark:border-border/50",
      "rounded-xl cursor-pointer",
      isMobile ? (
        "p-3 h-[140px] active:scale-[0.98]"
      ) : (
        "p-3 h-[90px] md:h-[110px] hover:scale-[1.02]"
      )
    )}
  >
    <div className="flex justify-between items-start mb-1">
      <div className="space-y-0.5">
        <p className="text-[13px] font-normal text-foreground/80 leading-tight">{titleLine1}</p>
        <p className="text-[13px] font-normal text-foreground/80 leading-tight">{titleLine2}</p>
      </div>
      <Icon className={cn(
        "text-muted-foreground opacity-80",
        isMobile ? "h-5 w-5" : "h-4 w-4"
      )} />
    </div>
    <div className="mt-auto space-y-2">
      <div className="text-[28px] font-bold leading-none text-foreground">
        {value}
      </div>
      <div className={cn(
        "w-[80%]",
        isMobile && "w-[90%]"
      )}>
        <ProgressBar progress={progress} />
      </div>
    </div>
  </Card>
);
