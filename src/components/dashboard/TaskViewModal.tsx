import React from "react";
import { Task } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "To Do": "secondary",
  "In Progress": "default", 
  "Under Review": "default", 
  "Done": "default", 
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "To Do": return "bg-ci-blue/10 text-ci-blue hover:bg-ci-blue/20";
    case "In Progress": return "bg-ci-yellow/10 text-ci-yellow hover:bg-ci-yellow/20";
    case "Under Review": return "bg-ci-orange/10 text-ci-orange hover:bg-ci-orange/20";
    case "Done": return "bg-ci-green/10 text-ci-green hover:bg-ci-green/20";
    default: return "bg-slate-100 text-slate-800";
  }
};

interface TaskViewModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskViewModal({ task, isOpen, onClose }: TaskViewModalProps) {
  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-950">
        <DialogHeader>
          <DialogTitle className="text-xl">Task Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{task.Task_Name}</h3>
              <p className="text-sm text-slate-500">ID: {task.Task_ID}</p>
            </div>
            <Badge variant={STATUS_VARIANTS[task.Status]} className={getStatusColor(task.Status)}>
              {task.Status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-sm font-medium text-slate-500">Website</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{task.Website_Name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Main Task</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{task.Main_Task}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Assignee</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{task.Assignee}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Category</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{task.Category}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Dates</p>
              <p className="text-sm text-slate-900 dark:text-slate-100">{task.Start_Date} to {task.Due_Date}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Priority</p>
              <Badge variant="outline" className="mt-1">{task.Priority}</Badge>
            </div>
          </div>

          

          <div>
            <p className="text-sm font-medium text-slate-500">Remarks</p>
            <div className="mt-1 p-3 bg-slate-50 dark:bg-slate-900 rounded-md text-sm text-slate-700 dark:text-slate-300 min-h-[60px] whitespace-pre-wrap">
              {task.Checklist_Remarks || "No remarks provided."}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
