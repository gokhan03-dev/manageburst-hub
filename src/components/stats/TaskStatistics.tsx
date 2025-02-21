
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
      <div className="hidden md:grid md:grid-cols-3 gap-3">
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
          <CarouselContent className="-ml-4 pb-20">
            {statsCards.map((stat, index) => (
              <CarouselItem key={index} className="pl-4 basis-[85%] min-w-0">
                <StatCard {...stat} isMobile />
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
      "flex flex-col bg-white border-none transition-all duration-200 ease-out",
      "shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]",
      "rounded-2xl cursor-pointer",
      isMobile ? (
        "p-4 h-[160px] active:scale-[0.98]"
      ) : (
        "p-4 h-[100px] md:h-[120px] hover:scale-[1.02]"
      )
    )}
  >
    <div className="flex justify-between items-start mb-3">
      <div className="space-y-0.5">
        <p className="text-[14px] font-normal text-[#1D1D1F] leading-tight">{titleLine1}</p>
        <p className="text-[14px] font-normal text-[#1D1D1F] leading-tight">{titleLine2}</p>
      </div>
      <Icon className={cn(
        "text-[#86868B] opacity-80",
        isMobile ? "h-6 w-6" : "h-4 w-4"
      )} />
    </div>
    <div className="mt-auto space-y-3">
      <div className="text-[32px] font-bold leading-none text-black">
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
