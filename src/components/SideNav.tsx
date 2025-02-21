import React, { useState } from "react";
import { Button } from "./ui/button";
import { 
  Menu, 
  ArrowLeft, 
  ArrowRight, 
  LayoutDashboard, 
  Settings, 
  HelpCircle, 
  LogOut,
  Calendar,
  CalendarRange,
  ListTodo,
  ArrowUpRight,
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

interface NavItem {
  title: string;
  icon: LucideIcon;
  href: string;
  filterType?: "all" | "today" | "this-week" | "upcoming";
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
                "focus:outline-none focus:ring-2 focus:ring-primary",
                isCollapsed && "justify-center px-2",
                isActive && "bg-accent text-foreground"
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

  return (
    <>
      {/* Mobile Navigation */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-40 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <div className="flex-1 p-4">
            <NavContent />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Navigation */}
      <div 
        className={cn(
          "hidden h-screen flex-col gap-4 border-r bg-card p-4 transition-all duration-300 ease-in-out lg:flex",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="h-6 w-6"
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
