"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Task } from "@/lib/types";
import { format, differenceInDays, addDays, startOfMonth, endOfMonth, isToday } from "date-fns";
import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GanttChartProps {
  tasks: Task[];
  dateRange: { start: Date; end: Date };
}

const STATUS_COLORS: Record<string, string> = {
  "To Do": "bg-ci-blue text-slate-900",
  "In Progress": "bg-ci-yellow text-slate-900",
  "Under Review": "bg-ci-orange text-white",
  "Done": "bg-ci-green text-white",
  "Blocked": "bg-red-500 text-white",
};

export function GanttChart({ tasks, dateRange }: GanttChartProps) {
  // Generate days array for the grid
  const daysInView = differenceInDays(dateRange.end, dateRange.start) + 1;
  const daysArray = Array.from({ length: daysInView }, (_, i) => addDays(dateRange.start, i));

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.Main_Task]) acc[task.Main_Task] = [];
    acc[task.Main_Task].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const toggleGroup = (mainTask: string) => {
    setExpandedGroups(prev => ({ ...prev, [mainTask]: !prev[mainTask] }));
  };

  return (
    <Card className="mb-8 shadow-sm overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">Project Timeline</CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto relative pb-4">
        <div className="min-w-[800px]">
          {/* Header Row (Dates) */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 sticky top-0 z-10">
            <div className="w-64 flex-shrink-0 p-3 font-semibold text-sm text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">
              Task Name
            </div>
            <div className="flex-1 flex">
              {daysArray.map((day, i) => (
                <div 
                  key={i} 
                  className={`flex-1 min-w-[30px] border-r border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center py-2 text-xs
                    ${isToday(day) ? 'bg-blue-50 dark:bg-blue-900/20 font-bold text-blue-600' : 'text-slate-500'}
                  `}
                >
                  <span>{format(day, 'MMM')}</span>
                  <span>{format(day, 'd')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Task Rows */}
          <div className="relative">
            {/* Absolute Overlay for Today Indicator spanning all rows */}
            {daysArray.findIndex(d => isToday(d)) !== -1 && (
              <div 
                className="absolute top-0 bottom-0 w-[4px] bg-red-500 opacity-80 z-20 pointer-events-none rounded-full"
                style={{ 
                  left: `calc(256px + ((100% - 256px) / ${daysInView}) * ${daysArray.findIndex(d => isToday(d))} + ((100% - 256px) / ${daysInView}) / 2)`,
                  transform: 'translateX(-50%)'
                }}
              />
            )}

            {Object.keys(groupedTasks).length === 0 ? (
              <div className="p-8 text-center text-slate-500">No tasks in this period</div>
            ) : (
              Object.keys(groupedTasks).map(mainTask => (
                <React.Fragment key={mainTask}>
                  {/* Group Header Row */}
                  <div className="flex border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/30 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10 relative">
                    <div className="w-64 flex-shrink-0 p-3 text-sm flex items-center border-r border-slate-200 dark:border-slate-800 cursor-pointer" onClick={() => toggleGroup(mainTask)}>
                      <Button variant="ghost" size="icon" className="h-6 w-6 mr-2">
                        {expandedGroups[mainTask] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                      <span className="truncate">{mainTask}</span>
                    </div>
                    <div className="flex-1 relative cursor-pointer" onClick={() => toggleGroup(mainTask)}>
                       <div className="absolute inset-0 flex pointer-events-none">
                        {daysArray.map((_, i) => (
                          <div key={i} className="flex-1 border-r border-slate-100 dark:border-slate-800/30"></div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Child Rows */}
                  {expandedGroups[mainTask] && [...groupedTasks[mainTask]].sort((a, b) => new Date(a.Start_Date).getTime() - new Date(b.Start_Date).getTime()).map(task => {
                    const taskStart = new Date(task.Start_Date);
                    const taskEnd = new Date(task.Due_Date);
                    
                    const startDiff = differenceInDays(taskStart, dateRange.start);
                    const duration = differenceInDays(taskEnd, taskStart) + 1;
                    
                    const startIdx = Math.max(0, startDiff);
                    const endIdx = Math.min(daysInView, startDiff + duration);
                    const visibleDuration = endIdx - startIdx;
                    
                    const isVisible = visibleDuration > 0 && startIdx < daysInView;

                    return (
                      <div key={task.Task_ID} className="flex border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 group relative z-10">
                        <div className="w-64 flex-shrink-0 p-3 pl-12 text-sm truncate border-r border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300" title={task.Task_Name}>
                          {task.Task_Name}
                        </div>
                        <div className="flex-1 relative">
                          <div className="absolute inset-0 flex pointer-events-none">
                            {daysArray.map((_, i) => (
                              <div key={i} className="flex-1 border-r border-slate-100 dark:border-slate-800/30"></div>
                            ))}
                          </div>
                          
                          {isVisible && (
                            <div 
                              className={`absolute top-2 h-8 rounded-md shadow-sm flex items-center px-2 text-xs font-medium truncate cursor-pointer hover:opacity-90 transition-opacity ${STATUS_COLORS[task.Status] || 'bg-slate-400'}`}
                              style={{
                                left: `${(startIdx / daysInView) * 100}%`,
                                width: `${(visibleDuration / daysInView) * 100}%`
                              }}
                              title={`${task.Task_Name} (${task.Status})`}
                            >
                              {visibleDuration > 2 ? task.Assignee : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
