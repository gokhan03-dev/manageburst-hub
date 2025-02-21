
import React from "react";
import { TaskProvider } from "@/contexts/TaskContext";
import { TaskBoard } from "@/components/TaskBoard";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { SideNav } from "@/components/SideNav";

const Index = () => {
  const { signOut, user } = useAuth();

  return (
    <TaskProvider>
      <div className="flex min-h-screen bg-gray-50">
        <SideNav />
        <div className="flex-1 overflow-auto">
          <div className="px-4 py-8">
            <div className="mx-auto max-w-7xl">
              <header className="mb-8">
                <div className="flex items-center justify-between">
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
                  <Button 
                    variant="outline" 
                    onClick={signOut}
                    aria-label="Sign out"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Button>
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
  );
};

export default Index;
