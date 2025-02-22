
import React, { useState } from "react";
import { MobileNav } from "./navigation/MobileNav";
import { DesktopNav } from "./navigation/DesktopNav";
import { TaskProvider } from "@/contexts/TaskContext";
import { FilterProvider } from "@/contexts/FilterContext";

export const SideNav = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <FilterProvider>
      <TaskProvider>
        <MobileNav />
        <DesktopNav isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </TaskProvider>
    </FilterProvider>
  );
};
