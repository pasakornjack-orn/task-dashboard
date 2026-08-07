"use client";

import React, { useState } from "react";
import { Task } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">Task Details</CardTitle>
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
                      <TableRow key={task.Task_ID} className="bg-white dark:bg-slate-950">
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
                            <div className="flex justify-end gap-1">
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
    </Card>
  );
}
