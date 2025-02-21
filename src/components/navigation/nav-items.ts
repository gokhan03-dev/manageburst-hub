
import { LucideIcon, Menu, ArrowLeft, ArrowRight, Settings, HelpCircle, LogOut, Calendar, CalendarRange, ListTodo, ArrowUpRight, Plus } from "lucide-react";

export type FilterType = "all" | "today" | "this-week" | "upcoming";

export interface NavItem {
  title: string;
  icon: LucideIcon;
  href: string;
  filterType?: FilterType;
}

export interface MobileNavItem {
  title: string;
  icon: LucideIcon;
  filterType?: FilterType;
  href?: string;
}

export const navItems: NavItem[] = [
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

export const mobileNavItems: MobileNavItem[] = [
  {
    title: "Today",
    icon: Calendar,
    filterType: "today"
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
