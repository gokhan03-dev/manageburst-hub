
import React from "react";
import { Button } from "./ui/button";
import { Menu, ChevronLeft, ChevronRight, LayoutDashboard, Settings, HelpCircle, LucideIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  icon: LucideIcon;
  href: string;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
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
  const [isOpen, setIsOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const NavContent = () => (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <a
            key={item.title}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900",
              "focus:outline-none focus:ring-2 focus:ring-primary",
              window.location.pathname === item.href &&
                "bg-gray-100 text-gray-900"
            )}
            aria-current={window.location.pathname === item.href ? "page" : undefined}
          >
            <Icon className="h-5 w-5" />
            {!isCollapsed && <span>{item.title}</span>}
          </a>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile Navigation */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <SheetHeader>
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <NavContent />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Navigation */}
      <div 
        className={cn(
          "hidden h-screen flex-col gap-4 border-r bg-white p-4 transition-all duration-300 ease-in-out lg:flex",
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
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
        <NavContent />
      </div>
    </>
  );
};
