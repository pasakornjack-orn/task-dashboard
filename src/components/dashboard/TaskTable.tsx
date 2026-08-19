"use client";

import React, { useState } from "react";
import { Task } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Edit, Trash2, Eye, Download, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskViewModal } from "./TaskViewModal";
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
  const [sortConfig, setSortConfig] = useState<{ key: keyof Task | null, direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });

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
    
    const headers = [
      "Task ID", "Website Name", "Main Task", "Sub Task", 
      "Assignee", "Category", "Start Date", "Due Date", 
      "Status", "Priority", "Remark"
    ];
    const escapeCSV = (str: string) => {
      if (!str) return '""';
      return `"${str.replace(/"/g, '""')}"`;
    };
    
    const rows = userTasks.map(t => [
      escapeCSV(t.Task_ID),
      escapeCSV(t.Website_Name),
      escapeCSV(t.Main_Task),
      escapeCSV(t.Task_Name),
      escapeCSV(t.Assignee),
      escapeCSV(t.Category),
      escapeCSV(t.Start_Date),
      escapeCSV(t.Due_Date),
      escapeCSV(t.Status),
      escapeCSV(t.Priority),
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


  const handleSort = (key: keyof Task) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Task) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="ml-2 h-4 w-4 inline text-slate-400" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="ml-2 h-4 w-4 inline text-slate-800 dark:text-slate-200" /> : <ArrowDown className="ml-2 h-4 w-4 inline text-slate-800 dark:text-slate-200" />;
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
              <TableHead className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none whitespace-nowrap" onClick={() => handleSort('Task_Name')}>
                Task Name {getSortIcon('Task_Name')}
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none whitespace-nowrap" onClick={() => handleSort('Task_ID')}>
                Task ID {getSortIcon('Task_ID')}
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none whitespace-nowrap" onClick={() => handleSort('Assignee')}>
                Assignee {getSortIcon('Assignee')}
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none whitespace-nowrap" onClick={() => handleSort('Category')}>
                Category {getSortIcon('Category')}
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none whitespace-nowrap" onClick={() => handleSort('Start_Date')}>
                Start Date {getSortIcon('Start_Date')}
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none whitespace-nowrap" onClick={() => handleSort('Due_Date')}>
                Due Date {getSortIcon('Due_Date')}
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none whitespace-nowrap" onClick={() => handleSort('Status')}>
                Status {getSortIcon('Status')}
              </TableHead>
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
                  {expandedGroups[mainTask] && groupedTasks[mainTask].sort((a, b) => {
                    if (!sortConfig.key) return 0;
                    let aVal: any = a[sortConfig.key];
                    let bVal: any = b[sortConfig.key];
                    
                    if (sortConfig.key === 'Task_ID') {
                      // Numerical sort for Task_ID
                      aVal = parseInt(String(aVal), 10) || 0;
                      bVal = parseInt(String(bVal), 10) || 0;
                    } else {
                      aVal = String(aVal || '').toLowerCase();
                      bVal = String(bVal || '').toLowerCase();
                    }
                    
                    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                    return 0;
                  }).map(task => {
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
                          <div className="max-w-[200px] md:max-w-[300px] lg:max-w-[400px] truncate" title={task.Task_Name}>
                            {task.Task_Name}
                          </div>
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

      <TaskViewModal 
        task={selectedTask} 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)} 
        onEdit={currentUser?.role !== "Viewer" ? onEditTask : undefined}
      />
    </Card>
  );
}
