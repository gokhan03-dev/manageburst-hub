
import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  progress: number;
  className?: string;
}

export const ProgressBar = ({ progress, className }: ProgressBarProps) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div 
      className={cn(
        "h-1 bg-[#F5F5F7] rounded-[2px] overflow-hidden",
        className
      )}
    >
      <div
        className="h-full bg-[#007AFF] opacity-90 transition-all duration-300 ease-out"
        style={{ 
          width: mounted ? `${Math.min(Math.max(progress, 0), 100)}%` : '0%',
        }}
      />
    </div>
  );
};
