
import React from "react";
import { TaskProvider } from "@/contexts/TaskContext";
import { FilterProvider } from "@/contexts/FilterContext";
import { TaskBoard } from "@/components/TaskBoard";
import { TaskStatistics } from "@/components/stats/TaskStatistics";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { SideNav } from "@/components/SideNav";
import { TooltipProvider } from "@/components/ui/tooltip";

const Index = () => {
  const { user } = useAuth();

  return (
    <FilterProvider>
      <TaskProvider>
        <TooltipProvider>
          <div className="flex min-h-screen bg-background">
            <SideNav />
            <div className="flex-1 lg:ml-64 overflow-auto">
              <div className="px-4 py-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                  <header className="mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 
                          className="mb-1 text-2xl md:text-3xl font-semibold tracking-tight text-foreground"
                          aria-label="Task Manager Dashboard"
                        >
                          Task Manager
                        </h1>
                        <p 
                          className="text-sm md:text-base text-muted-foreground"
                          aria-label={`Logged in as ${user?.email}`}
                        >
                          Welcome back, {user?.email}
                        </p>
                      </div>
                      <ThemeToggle />
                    </div>
                  </header>
                  <main className="space-y-6">
                    <TaskStatistics />
                    <TaskBoard />
                  </main>
                </div>
              </div>
            </div>
          </div>
        </TooltipProvider>
      </TaskProvider>
    </FilterProvider>
  );
};

export default Index;
