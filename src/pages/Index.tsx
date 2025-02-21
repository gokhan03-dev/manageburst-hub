
import React from "react";
import { TaskProvider } from "@/contexts/TaskContext";
import { FilterProvider } from "@/contexts/FilterContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TaskBoard } from "@/components/TaskBoard";
import { TaskStatistics } from "@/components/stats/TaskStatistics";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { SideNav } from "@/components/SideNav";

const Index = () => {
  const { user } = useAuth();

  return (
    <ThemeProvider>
      <FilterProvider>
        <TaskProvider>
          <div className="flex min-h-screen bg-background">
            <SideNav />
            <div className="flex-1 lg:ml-64 overflow-auto"> {/* Added margin for sidebar width */}
              <div className="px-4 py-8 lg:px-8">
                <div className="mx-auto max-w-7xl">
                  <header className="mb-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 
                          className="mb-2 text-4xl font-bold tracking-tight text-foreground"
                          aria-label="Task Manager Dashboard"
                        >
                          Task Manager
                        </h1>
                        <p 
                          className="text-lg text-muted-foreground"
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
        </TaskProvider>
      </FilterProvider>
    </ThemeProvider>
  );
};

export default Index;
