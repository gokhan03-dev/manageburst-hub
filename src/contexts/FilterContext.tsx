
import React, { createContext, useContext, useState } from "react";
import { startOfDay, endOfWeek, startOfWeek } from "date-fns";

type FilterType = "all" | "today" | "this-week" | "upcoming";

interface FilterContextType {
  currentFilter: FilterType;
  setCurrentFilter: (filter: FilterType) => void;
  getFilteredTaskCount: (tasks: any[], filter: FilterType) => number;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentFilter, setCurrentFilter] = useState<FilterType>("all");

  const getFilteredTaskCount = (tasks: any[], filter: FilterType): number => {
    const today = startOfDay(new Date());
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);

    return tasks.filter((task) => {
      const taskDate = task.dueDate ? new Date(task.dueDate) : null;
      
      switch (filter) {
        case "today":
          return taskDate && taskDate >= today && taskDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
        case "this-week":
          return taskDate && taskDate >= weekStart && taskDate <= weekEnd;
        case "upcoming":
          return taskDate && taskDate > weekEnd;
        default:
          return true;
      }
    }).length;
  };

  return (
    <FilterContext.Provider
      value={{
        currentFilter,
        setCurrentFilter,
        getFilteredTaskCount,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilter must be used within a FilterProvider");
  }
  return context;
};
