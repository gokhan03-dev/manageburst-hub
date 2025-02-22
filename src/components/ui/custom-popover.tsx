
import * as React from "react"
import { cn } from "@/lib/utils"

interface PopoverProps {
  children: React.ReactNode
  trigger: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  align?: "start" | "center" | "end"
}

export const CustomPopover = ({ 
  children, 
  trigger, 
  open: controlledOpen,
  onOpenChange,
  className,
  align = "center"
}: PopoverProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = onOpenChange ?? setUncontrolledOpen
  const popoverRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, setOpen])

  return (
    <div className="relative inline-block w-full" ref={popoverRef}>
      <div 
        onClick={() => setOpen(!open)}
        className="cursor-pointer w-full"
      >
        {trigger}
      </div>
      {open && (
        <div
          className={cn(
            "absolute z-50 mt-2 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95",
            {
              "left-0": align === "start",
              "left-1/2 -translate-x-1/2": align === "center",
              "right-0": align === "end"
            },
            className
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}
