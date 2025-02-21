
import React, { useState } from "react";
import { Button } from "./ui/button";
import { 
  Menu, 
  ArrowLeft, 
  ArrowRight, 
  Settings, 
  HelpCircle, 
  LogOut,
  Calendar,
  CalendarRange,
  ListTodo,
  ArrowUpRight,
  Plus,
  LucideIcon 
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useTaskContext } from "@/contexts/TaskContext";
import { useFilter } from "@/contexts/FilterContext";
import { Badge } from "./ui/badge";

type FilterType = "all" | "today" | "this-week" | "upcoming";

interface NavItem {
  title: string;
  icon: LucideIcon;
  href: string;
  filterType?: FilterType;
}

interface MobileNavItem {
  title: string;
  icon: LucideIcon;
  filterType?: FilterType;
  href?: string;
}

const navItems: NavItem[] = [
  {
    title: "All Tasks",
    icon: ListTodo,
    href: "/",
    filterType: "all"
  },
  {
    title: "Today",
    icon: Calendar,
    href: "/",
    filterType: "today"
  },
  {
    title: "This Week",
    icon: CalendarRange,
    href: "/",
    filterType: "this-week"
  },
  {
    title: "Upcoming",
    icon: ArrowUpRight,
    href: "/",
    filterType: "upcoming"
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
  {
    title: "Help",
    icon: HelpCircle,
    href: "/help",
  },
];

const mobileNavItems: MobileNavItem[] = [
  {
    title: "Today",
    icon: Calendar,
    filterType: "today" as FilterType
  },
  {
    title: "Add Task",
    icon: Plus,
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

export const SideNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { signOut } = useAuth();
  const { tasks } = useTaskContext();
  const { currentFilter, setCurrentFilter, getFilteredTaskCount } = useFilter();

  const NavContent = () => (
    <div className="flex h-full flex-col justify-between">
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.filterType ? currentFilter === item.filterType : window.location.pathname === item.href;
          const taskCount = item.filterType ? getFilteredTaskCount(tasks, item.filterType) : null;

          return (
            <a
              key={item.title}
              href={item.href}
              onClick={(e) => {
                if (item.filterType) {
                  e.preventDefault();
                  setCurrentFilter(item.filterType);
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
  );

  const MobileNav = () => (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background py-2 lg:hidden z-50">
      <nav className="flex items-center justify-around">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.filterType ? currentFilter === item.filterType : window.location.pathname === item.href;

          return (
            <Button
              key={item.title}
              variant="ghost"
              size="sm"
              className={cn(
                "flex flex-col items-center gap-1 h-16 px-4",
                isActive && "text-primary"
              )}
              onClick={() => {
                if (item.filterType) {
                  setCurrentFilter(item.filterType);
                }
                // Add task button functionality can be added here
                if (item.title === "Add Task") {
                  // Handle add task click
                }
              }}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.title}</span>
            </Button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Navigation */}
      <MobileNav />

      {/* Desktop Navigation */}
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
        <NavContent />
      </div>
    </>
  );
};
