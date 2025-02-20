
import * as React from "react"
import { cn } from "@/lib/utils"

interface PopoverProps {
  children: React.ReactNode
  trigger: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}

export const CustomPopover = ({ 
  children, 
  trigger, 
  open: controlledOpen,
  onOpenChange,
  className 
}: PopoverProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = onOpenChange ?? setUncontrolledOpen

  return (
    <div className="relative inline-block w-full">
      <div 
        onClick={() => setOpen(!open)}
        className="cursor-pointer w-full"
      >
        {trigger}
      </div>
      {open && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div
            className={cn(
              "absolute z-50 w-auto rounded-md border bg-popover p-0 text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2",
              className
            )}
          >
            {children}
          </div>
        </>
      )}
    </div>
  )
}
