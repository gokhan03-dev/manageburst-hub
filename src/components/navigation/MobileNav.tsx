
import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTaskContext } from "@/contexts/TaskContext";
import { useFilter } from "@/contexts/FilterContext";
import { Badge } from "@/components/ui/badge";
import { TaskDialog } from "@/components/board/TaskDialog";
import { useLocation, useNavigate } from "react-router-dom";
import { mobileNavItems } from "./nav-items";
import { cn } from "@/lib/utils";
import { Task } from "@/types/task";

export const MobileNav = () => {
  const [taskDialogOpen, setTaskDialogOpen] = React.useState(false);
  const { tasks, addTask } = useTaskContext();
  const { currentFilter, setCurrentFilter } = useFilter();
  const location = useLocation();
  const navigate = useNavigate();

  const handleTaskSubmit = (data: Omit<Task, "id" | "createdAt">) => {
    addTask(data);
    setTaskDialogOpen(false);
  };

  const getTodayTaskCount = () => {
    return tasks.filter(task => {
      const today = new Date();
      const taskDate = task.dueDate ? new Date(task.dueDate) : null;
      return taskDate && 
             taskDate.toDateString() === today.toDateString() && 
             (task.status === "todo" || task.status === "in-progress");
    }).length;
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background py-2 lg:hidden z-50">
        <nav className="flex items-center justify-around">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.filterType 
              ? currentFilter === item.filterType 
              : item.href ? location.pathname === item.href : false;
            const todayCount = item.filterType === "today" ? getTodayTaskCount() : null;
            const isAddTask = item.title === "Add Task";

            return (
              <Button
                key={item.title}
                variant={isAddTask ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "flex flex-col items-center gap-1",
                  isAddTask ? 
                    "h-16 w-16 bg-[#1A1F2C] hover:bg-[#221F26] text-white rounded-xl shadow-sm transition-all duration-200" : 
                    "h-16 px-4",
                  isActive && !isAddTask && "text-primary"
                )}
                onClick={() => {
                  if (item.filterType) {
                    setCurrentFilter(item.filterType);
                    navigate('/');
                  } else if (item.href) {
                    navigate(item.href);
                  } else if (isAddTask) {
                    setTaskDialogOpen(true);
                  }
                }}
              >
                <div className="relative">
                  <Icon className={cn("h-5 w-5", isAddTask && "animate-pulse")} />
                  {todayCount !== null && todayCount > 0 && (
                    <Badge 
                      variant="default"
                      className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-[10px] rounded-full"
                    >
                      {todayCount}
                    </Badge>
                  )}
                </div>
                <span className="text-xs">{item.title}</span>
              </Button>
            );
          })}
        </nav>

        <TaskDialog
          isOpen={taskDialogOpen}
          onOpenChange={setTaskDialogOpen}
          onSubmit={handleTaskSubmit}
        />
      </div>
    </>
  );
};
