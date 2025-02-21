
import React from "react";
import { TaskProvider } from "@/contexts/TaskContext";
import { FilterProvider } from "@/contexts/FilterContext";
import { TaskBoard } from "@/components/TaskBoard";
import { useAuth } from "@/contexts/AuthContext";
import { SideNav } from "@/components/SideNav";

const Index = () => {
  const { user } = useAuth();

  return (
    <FilterProvider>
      <TaskProvider>
        <div className="flex min-h-screen bg-gray-50">
          <SideNav />
          <div className="flex-1 overflow-auto">
            <div className="px-4 py-8 lg:px-8">
              <div className="mx-auto max-w-7xl">
                <header className="mb-8">
                  <div className="text-left">
                    <h1 
                      className="mb-2 text-4xl font-bold tracking-tight text-gray-900"
                      aria-label="Task Manager Dashboard"
                    >
                      Task Manager
                    </h1>
                    <p 
                      className="text-lg text-gray-600"
                      aria-label={`Logged in as ${user?.email}`}
                    >
                      Welcome back, {user?.email}
                    </p>
                  </div>
                </header>
                <main>
                  <TaskBoard />
                </main>
              </div>
            </div>
          </div>
        </div>
      </TaskProvider>
    </FilterProvider>
  );
};

export default Index;
