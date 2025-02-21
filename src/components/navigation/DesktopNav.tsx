
import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut, ArrowLeft, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFilter } from "@/contexts/FilterContext";
import { Badge } from "@/components/ui/badge";
import { useLocation, useNavigate } from "react-router-dom";
import { navItems } from "./nav-items";
import { cn } from "@/lib/utils";
import { useTaskContext } from "@/contexts/TaskContext";

interface DesktopNavProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export const DesktopNav: React.FC<DesktopNavProps> = ({ isCollapsed, setIsCollapsed }) => {
  const { signOut } = useAuth();
  const { currentFilter, setCurrentFilter, getFilteredTaskCount } = useFilter();
  const location = useLocation();
  const navigate = useNavigate();
  const { tasks } = useTaskContext();

  return (
    <div 
      className={cn(
        "hidden fixed inset-y-0 left-0 flex-col gap-4 border-r bg-background p-4 transition-all duration-300 ease-in-out lg:flex dark:bg-secondary/50",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex justify-end items-center h-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="h-8 w-8 flex items-center justify-center"
        >
          {isCollapsed ? (
            <ArrowRight className="h-4 w-4" />
          ) : (
            <ArrowLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex h-full flex-col justify-between">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.filterType 
              ? currentFilter === item.filterType 
              : location.pathname === item.href;

            const taskCount = item.filterType ? getFilteredTaskCount(tasks, item.filterType) : null;

            return (
              <a
                key={item.title}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  if (item.filterType) {
                    setCurrentFilter(item.filterType);
                    navigate('/');
                  } else {
                    navigate(item.href);
                  }
                }}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-ring",
                  isCollapsed && "justify-center px-2",
                  isActive && "bg-accent text-accent-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className={cn(
                  "shrink-0 transition-all",
                  isCollapsed ? "h-6 w-6" : "h-5 w-5"
                )} />
                {!isCollapsed && (
                  <span className="flex-1">{item.title}</span>
                )}
                {!isCollapsed && taskCount !== null && (
                  <Badge variant="secondary" className="ml-auto">
                    {taskCount}
                  </Badge>
                )}
              </a>
            );
          })}
        </nav>
        <Button
          variant="ghost"
          className={cn(
            "mt-auto w-full justify-start gap-3",
            isCollapsed && "justify-center px-2"
          )}
          onClick={signOut}
        >
          <LogOut className={cn(
            "shrink-0 transition-all",
            isCollapsed ? "h-6 w-6" : "h-5 w-5"
          )} />
          {!isCollapsed && <span>Sign out</span>}
        </Button>
      </div>
    </div>
  );
};
