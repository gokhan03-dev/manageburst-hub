
import React from "react";
import { Button } from "./ui/button";
import { Menu, X, LayoutDashboard, Settings, HelpCircle } from "lucide-react";
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
  icon: React.ComponentType;
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

  const NavContent = () => (
    <nav className="space-y-2">
      {navItems.map((item) => (
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
          <item.icon className="h-5 w-5" />
          <span>{item.title}</span>
        </a>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile Navigation */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="lg:hidden">
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
      <div className="hidden h-screen w-64 flex-col gap-4 border-r bg-white p-4 lg:flex">
        <NavContent />
      </div>
    </>
  );
};
