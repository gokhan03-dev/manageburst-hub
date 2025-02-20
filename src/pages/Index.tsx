
import React from "react";
import { TaskProvider } from "@/contexts/TaskContext";
import { TaskBoard } from "@/components/TaskBoard";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const Index = () => {
  const { signOut, user } = useAuth();

  return (
    <TaskProvider>
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <h1 className="mb-2 text-4xl font-bold tracking-tight text-gray-900">
                  Task Manager
                </h1>
                <p className="text-lg text-gray-600">
                  Welcome back, {user?.email}
                </p>
              </div>
              <Button variant="outline" onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </header>
          <TaskBoard />
        </div>
      </div>
    </TaskProvider>
  );
};

export default Index;
