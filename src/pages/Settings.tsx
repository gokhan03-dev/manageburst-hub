
import React from "react";
import { Settings as SettingsIcon, ChevronRight, User, Bell, Palette, Globe, Lock, Database, HelpCircle, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger 
} from "@/components/ui/sheet";
import { CategoryManager } from "@/components/CategoryManager";

export const Settings = () => {
  const { user, signOut } = useAuth();

  const settingsSections = [
    {
      title: "Appearance",
      icon: <Palette className="h-4 w-4" />,
      items: [
        {
          label: "Theme",
          value: "Change app theme",
          action: <ThemeToggle />,
        },
      ],
    },
    {
      title: "Notifications",
      icon: <Bell className="h-4 w-4" />,
      items: [
        {
          label: "Email Notifications",
          value: "Manage email preferences",
          action: (
            <Button variant="ghost" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          ),
        },
      ],
    },
    {
      title: "Account",
      icon: <User className="h-4 w-4" />,
      items: [
        {
          label: "Profile",
          value: user?.email,
        },
        {
          label: "Sign Out",
          value: "Exit your account",
          onClick: signOut,
          destructive: true,
        },
      ],
    },
    {
      title: "Task Management",
      icon: <SettingsIcon className="h-4 w-4" />,
      items: [
        {
          label: "Categories",
          value: "Manage task categories",
          action: (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Categories</SheetTitle>
                </SheetHeader>
                <CategoryManager />
              </SheetContent>
            </Sheet>
          ),
        },
      ],
    },
    {
      title: "Integrations",
      icon: <Calendar className="h-4 w-4" />,
      items: [
        {
          label: "Microsoft 365",
          value: "Connect calendar",
          action: (
            <Button variant="ghost" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          ),
        },
      ],
    },
    {
      title: "Data & Privacy",
      icon: <Database className="h-4 w-4" />,
      items: [
        {
          label: "Export Data",
          value: "Download your data",
          action: (
            <Button variant="ghost" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          ),
        },
      ],
    },
    {
      title: "Help & Support",
      icon: <HelpCircle className="h-4 w-4" />,
      items: [
        {
          label: "Documentation",
          value: "View user guides",
          action: (
            <Button variant="ghost" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          ),
        },
      ],
    },
  ];

  return (
    <div className="container max-w-2xl py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="space-y-6">
        {settingsSections.map((section, index) => (
          <div key={section.title} className="space-y-4">
            <div className="flex items-center gap-2">
              {section.icon}
              <h2 className="text-lg font-semibold">{section.title}</h2>
            </div>
            <div className="rounded-lg border divide-y">
              {section.items.map((item, itemIndex) => (
                <div
                  key={item.label}
                  className={`flex items-center justify-between p-4 ${
                    item.onClick ? "cursor-pointer hover:bg-accent" : ""
                  }`}
                  onClick={item.onClick}
                >
                  <div className="space-y-0.5">
                    <div className={`text-sm font-medium ${
                      item.destructive ? "text-destructive" : ""
                    }`}>
                      {item.label}
                    </div>
                    {item.value && (
                      <div className="text-sm text-muted-foreground">
                        {item.value}
                      </div>
                    )}
                  </div>
                  {item.action}
                </div>
              ))}
            </div>
            {index < settingsSections.length - 1 && <Separator />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Settings;
