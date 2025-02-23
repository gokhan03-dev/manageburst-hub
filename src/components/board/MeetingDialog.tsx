
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Task } from "@/types/task";
import { MeetingForm } from "@/components/MeetingForm";
import { SyncStatus } from "@/components/integrations/microsoft/SyncStatus";

interface MeetingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMeeting?: Task;
  onSubmit: (data: Omit<Task, "id" | "createdAt">) => void;
}

export function MeetingDialog({
  isOpen,
  onOpenChange,
  selectedMeeting,
  onSubmit,
}: MeetingDialogProps) {
  const handleSubmit = (data: Omit<Task, "id" | "createdAt">) => {
    onSubmit({
      ...data,
      eventType: "meeting",
    });
  };

  const dialogDescription = selectedMeeting 
    ? "Edit the details of your meeting" 
    : "Create a new meeting with the details below";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-semibold">
              {selectedMeeting ? "Edit" : "Create New"} Meeting
            </DialogTitle>
            {selectedMeeting && <SyncStatus taskId={selectedMeeting.id} />}
          </div>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <div className="mt-6 overflow-y-auto flex-1 pr-6 -mr-6">
          <MeetingForm
            onSubmit={handleSubmit}
            initialData={selectedMeeting}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

