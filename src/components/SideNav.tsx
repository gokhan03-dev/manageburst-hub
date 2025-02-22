
import React, { useState } from "react";
import { MobileNav } from "./navigation/MobileNav";
import { DesktopNav } from "./navigation/DesktopNav";

export const SideNav = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      <MobileNav />
      <DesktopNav isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
    </>
  );
};
