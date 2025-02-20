
import React from "react";
import { TaskProvider } from "@/contexts/TaskContext";
import { TaskBoard } from "@/components/TaskBoard";

const Index = () => {
  return (
    <TaskProvider>
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <header className="mb-8 text-center">
            <h1 className="mb-2 text-4xl font-bold tracking-tight text-gray-900">
              Task Manager
            </h1>
            <p className="text-lg text-gray-600">
              Organize your tasks with ease and elegance
            </p>
          </header>
          <TaskBoard />
        </div>
      </div>
    </TaskProvider>
  );
};

export default Index;
