"use client";

import React, { useState } from "react";
import { Task } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Edit, Trash2, Eye, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { User } from "@/lib/types";

interface TaskTableProps {
  tasks: Task[];
  currentUser: User | null;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "To Do": "secondary",
  "In Progress": "default", 
  "Under Review": "default", 
  "Done": "default", 
};

export function TaskTable({ tasks, currentUser, onEditTask, onDeleteTask }: TaskTableProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.Main_Task]) acc[task.Main_Task] = [];
    acc[task.Main_Task].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "To Do": return "bg-ci-blue/10 text-ci-blue hover:bg-ci-blue/20";
      case "In Progress": return "bg-ci-yellow/10 text-ci-yellow hover:bg-ci-yellow/20";
      case "Under Review": return "bg-ci-orange/10 text-ci-orange hover:bg-ci-orange/20";
      case "Done": return "bg-ci-green/10 text-ci-green hover:bg-ci-green/20";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  const toggleGroup = (mainTask: string) => {
    setExpandedGroups(prev => ({ ...prev, [mainTask]: !prev[mainTask] }));
  };

  const isOverdue = (dueDateStr: string, status: string) => {
    if (status === "Done") return false;
    const dueDate = new Date(dueDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of today
    return dueDate < today;
  };

  const exportToCSV = () => {
    if (!currentUser) return;
    
    const userTasks = tasks.filter(t => t.Assignee === currentUser.name);
    if (userTasks.length === 0) {
      alert("No tasks found for you.");
      return;
    }
    
    const headers = ["Main Task", "Sub Task", "Remark"];
    const escapeCSV = (str: string) => {
      if (!str) return '""';
      return `"${str.replace(/"/g, '""')}"`;
    };
    
    const rows = userTasks.map(t => [
      escapeCSV(t.Main_Task),
      escapeCSV(t.Task_Name),
      escapeCSV(t.Checklist_Remarks || "")
    ].join(","));
    
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const monthStr = new Date().toLocaleString("en-US", { month: "short", year: "numeric" });
    link.setAttribute("download", `My_Report_${currentUser.name}_${monthStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">Task Details</CardTitle>
        <Button onClick={exportToCSV} variant="outline" size="sm" className="bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <Download className="w-4 h-4 mr-2" /> Export My Report (CSV)
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900">
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead>Task Name</TableHead>
              <TableHead>Task ID</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              {currentUser?.role !== "Viewer" && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.keys(groupedTasks).length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                  No tasks found.
                </TableCell>
              </TableRow>
            ) : (
              Object.keys(groupedTasks)
                .sort((a, b) => {
                  const minStartA = Math.min(...groupedTasks[a].map(t => new Date(t.Start_Date).getTime()));
                  const minStartB = Math.min(...groupedTasks[b].map(t => new Date(t.Start_Date).getTime()));
                  return minStartA - minStartB;
                })
                .map(mainTask => (
                <React.Fragment key={mainTask}>
                  <TableRow className="bg-slate-50/50 dark:bg-slate-800/30 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleGroup(mainTask)}>
                        {expandedGroups[mainTask] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                    <TableCell colSpan={8} className={`cursor-pointer ${groupedTasks[mainTask].some(t => isOverdue(t.Due_Date, t.Status)) ? 'text-red-600 font-bold' : ''}`} onClick={() => toggleGroup(mainTask)}>
                      {mainTask} <span className="text-slate-400 font-normal ml-2">({groupedTasks[mainTask].length} tasks)</span>
                    </TableCell>
                  </TableRow>
                  
                  {/* Child Rows */}
                  {expandedGroups[mainTask] && groupedTasks[mainTask].map(task => {
                    // Can delete if the user is the creator (or assignee as fallback if createdBy isn't set), or Manager
                    const canDelete = currentUser?.role === "Manager" || currentUser?.name === task.CreatedBy || (!task.CreatedBy && currentUser?.name === task.Assignee);

                    return (
                      <TableRow 
                        key={task.Task_ID} 
                        className="bg-white dark:bg-slate-950 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                        onClick={() => {
                          setSelectedTask(task);
                          setIsViewModalOpen(true);
                        }}
                      >
                        <TableCell></TableCell>
                        <TableCell className={`pl-6 text-sm ${isOverdue(task.Due_Date, task.Status) ? 'text-red-600 font-bold' : 'text-slate-600 dark:text-slate-300'}`}>
                          {task.Task_Name}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">{task.Task_ID}</TableCell>
                        <TableCell className="text-sm">{task.Assignee}</TableCell>
                        <TableCell className="text-xs text-slate-500">{task.Category}</TableCell>
                        <TableCell className="text-xs text-slate-500">{task.Start_Date}</TableCell>
                        <TableCell className={`text-xs ${isOverdue(task.Due_Date, task.Status) ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                          {task.Due_Date}
                        </TableCell>
                        <TableCell>
                          <Badge variant={STATUS_VARIANTS[task.Status]} className={getStatusColor(task.Status)}>
                            {task.Status}
                          </Badge>
                        </TableCell>
                        {currentUser?.role !== "Viewer" && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => onEditTask(task)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              {canDelete && (
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => onDeleteTask(task.Task_ID)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-950">
          <DialogHeader>
            <DialogTitle className="text-xl">Task Details</DialogTitle>
          </DialogHeader>
          
          {selectedTask && (
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{selectedTask.Task_Name}</h3>
                  <p className="text-sm text-slate-500">ID: {selectedTask.Task_ID}</p>
                </div>
                <Badge variant={STATUS_VARIANTS[selectedTask.Status]} className={getStatusColor(selectedTask.Status)}>
                  {selectedTask.Status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-sm font-medium text-slate-500">Website</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{selectedTask.Website_Name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Main Task</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{selectedTask.Main_Task}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Assignee</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{selectedTask.Assignee}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Category</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{selectedTask.Category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Start Date</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{selectedTask.Start_Date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Due Date</p>
                  <p className={`text-sm font-semibold ${isOverdue(selectedTask.Due_Date, selectedTask.Status) ? 'text-red-600' : 'text-slate-900 dark:text-slate-100'}`}>
                    {selectedTask.Due_Date} {isOverdue(selectedTask.Due_Date, selectedTask.Status) && "(Overdue)"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Priority</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{selectedTask.Priority}</p>
                </div>
              </div>

              <div className="pt-2 border-t mt-4">
                <p className="text-sm font-medium text-slate-500 mb-2">Remarks / Notes</p>
                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-md min-h-[100px] text-sm whitespace-pre-wrap">
                  {selectedTask.Checklist_Remarks || <span className="text-slate-400 italic">No remarks provided.</span>}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
            {currentUser?.role !== "Viewer" && selectedTask && (
              <Button 
                onClick={() => {
                  setIsViewModalOpen(false);
                  onEditTask(selectedTask);
                }}
                className="bg-ci-green hover:bg-ci-green/90 text-white"
              >
                <Edit className="w-4 h-4 mr-2" /> Edit Task
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
