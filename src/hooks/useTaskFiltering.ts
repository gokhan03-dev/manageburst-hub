
import { useMemo } from "react";
import { Task, TaskPriority, TaskStatus } from "@/types/task";
import { startOfDay, startOfWeek, endOfWeek } from "date-fns";

interface UseTaskFilteringProps {
  tasks: Task[];
  searchQuery: string;
  statusFilter: TaskStatus | "all";
  priorityFilter: TaskPriority | "all";
  sortBy: string;
  sortDirection: "asc" | "desc";
  currentFilter: string;
}

export const useTaskFiltering = ({
  tasks,
  searchQuery,
  statusFilter,
  priorityFilter,
  sortBy,
  sortDirection,
  currentFilter,
}: UseTaskFilteringProps) => {
  return useMemo(() => {
    return tasks
      .filter((task) => {
        // First apply the sidebar filter
        if (currentFilter !== "all") {
          const taskDate = task.dueDate ? new Date(task.dueDate) : null;
          const today = startOfDay(new Date());
          const weekStart = startOfWeek(today);
          const weekEnd = endOfWeek(today);

          switch (currentFilter) {
            case "today":
              if (!taskDate || taskDate < today || taskDate >= new Date(today.getTime() + 24 * 60 * 60 * 1000)) {
                return false;
              }
              break;
            case "this-week":
              if (!taskDate || taskDate < weekStart || taskDate > weekEnd) {
                return false;
              }
              break;
            case "upcoming":
              if (!taskDate || taskDate <= weekEnd) {
                return false;
              }
              break;
          }
        }

        // Then apply the search and other filters
        const matchesSearch = searchQuery
          ? task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchQuery.toLowerCase())
          : true;
        const matchesStatus = statusFilter === "all" ? true : task.status === statusFilter;
        const matchesPriority = priorityFilter === "all" ? true : task.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case "dueDate":
            comparison = new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime();
            break;
          case "priority": {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            comparison = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
            break;
          }
          case "title":
            comparison = a.title.localeCompare(b.title);
            break;
          case "createdAt":
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
          default:
            comparison = 0;
        }
        return sortDirection === "asc" ? comparison : -comparison;
      });
  }, [tasks, searchQuery, statusFilter, priorityFilter, sortBy, sortDirection, currentFilter]);
};
