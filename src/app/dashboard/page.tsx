"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Task } from "@/lib/types";
import { Scorecards } from "@/components/dashboard/Scorecards";
import { Charts } from "@/components/dashboard/Charts";
import { GanttChart } from "@/components/dashboard/GanttChart";
import { TaskTable } from "@/components/dashboard/TaskTable";
import { TaskForm } from "@/components/dashboard/TaskForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PlusCircle, RefreshCw } from "lucide-react";
import { startOfMonth, endOfMonth, isWithinInterval, format } from "date-fns";



export default function DashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Global Filters
  const [filterWebsite, setFilterWebsite] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterPriority, setFilterPriority] = useState<string>("All");
  
  // Date Range Filter (Default to current month)
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });
  
  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const url = new URL("/api/tasks", window.location.origin);
      
      const res = await fetch(url.toString());
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, filterWebsite]);

  // Apply frontend filters
  const filteredTasks = tasks.filter(task => {
    if (filterWebsite !== "All" && task.Website_Name !== filterWebsite) return false;
    if (filterStatus.length > 0 && !filterStatus.includes(task.Status)) return false;
    if (filterPriority !== "All" && task.Priority !== filterPriority) return false;
    
    // Check if task falls within selected date range
    const taskStart = new Date(task.Start_Date);
    const taskEnd = new Date(task.Due_Date);
    const filterStart = new Date(dateRange.start);
    const filterEnd = new Date(dateRange.end);
    
    // Task is included if its start or end date is within the range, or if it spans across the range
    const overlaps = taskStart <= filterEnd && taskEnd >= filterStart;
    if (!overlaps) return false;

    // Role-based Access Restriction
    const isAuthorized = user?.role === "Manager" || 
      (user?.role === "Viewer" && (!user?.assignedWebsites || user.assignedWebsites.length === 0)) ||
      ((user?.role === "Viewer" || user?.role === "Site Team Member") && 
       user?.assignedWebsites?.includes(task.Website_Name));
    
    if (!isAuthorized) return false;
    
    return true;
  });

  const handleSaveTask = async (taskData: Partial<Task>) => {
    const isEditing = !!editingTask;
    const method = isEditing ? "PUT" : "POST";
    
    // Add creator info if new task
    if (!isEditing && user) {
      taskData.CreatedBy = user.name;
    }
    
    try {
      await fetch("/api/tasks", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData)
      });
      await fetchTasks();
      setIsFormOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error("Failed to save task", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await fetch(`/api/tasks?id=${taskId}`, { method: "DELETE" });
      await fetchTasks();
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  // Get unique websites for the filter dropdown
  const uniqueWebsites = Array.from(new Set(tasks.map(t => t.Website_Name)));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        {/* Top Filter Bar */}
        <div className="flex flex-col xl:flex-row justify-between items-start bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 gap-4">
            
            {/* Left Side: Filters */}
            <div className="flex flex-col gap-3 w-full xl:w-auto">
              
              {/* Row 1: Date Filter */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-1 rounded-md border border-slate-200 dark:border-slate-800 w-fit">
                <span className="text-sm text-slate-500 pl-2">Month</span>
                <Input 
                  type="month" 
                  className="h-8 border-none bg-transparent" 
                  value={dateRange.start.substring(0, 7)} 
                  onChange={e => {
                    if (!e.target.value) return;
                    const [year, month] = e.target.value.split('-');
                    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
                    setDateRange({
                      start: format(startOfMonth(date), 'yyyy-MM-dd'),
                      end: format(endOfMonth(date), 'yyyy-MM-dd')
                    });
                  }} 
                />
                <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>
                <span className="text-sm text-slate-500">Custom:</span>
                <Input type="date" className="h-8 w-32 border-none bg-transparent px-1" value={dateRange.start} onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))} />
                <span className="text-sm text-slate-500">-</span>
                <Input type="date" className="h-8 w-32 border-none bg-transparent px-1" value={dateRange.end} onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))} />
              </div>

              {/* Row 2: Dropdown Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-1 rounded-md border border-slate-200 dark:border-slate-800">
                  <span className="text-sm text-slate-500 pl-2">Website</span>
                  <Select value={filterWebsite} onValueChange={(val: any) => setFilterWebsite(val)}>
                    <SelectTrigger className="w-[140px] border-none bg-transparent shadow-none focus:ring-0">
                      <SelectValue placeholder="All Websites" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Websites</SelectItem>
                      {uniqueWebsites.map(w => {
                        const isAuthorized = user?.role === "Manager" || 
                          (user?.role === "Viewer" && (!user?.assignedWebsites || user.assignedWebsites.length === 0)) ||
                          ((user?.role === "Viewer" || user?.role === "Site Team Member") && 
                           user?.assignedWebsites?.includes(w));
                        if (!isAuthorized) return null;
                        return <SelectItem key={w} value={w}>{w}</SelectItem>;
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-1 rounded-md border border-slate-200 dark:border-slate-800">
                  <span className="text-sm text-slate-500 pl-2">Status</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex h-8 w-[140px] items-center justify-between px-3 text-sm font-normal bg-transparent border-none shadow-none focus:outline-none focus:ring-0">
                      {filterStatus.length === 0 ? "All Statuses" : `${filterStatus.length} Selected`}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      {["To Do", "In Progress", "Under Review", "Done"].map(status => (
                        <DropdownMenuCheckboxItem
                          key={status}
                          checked={filterStatus.includes(status)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilterStatus([...filterStatus, status]);
                            } else {
                              setFilterStatus(filterStatus.filter(s => s !== status));
                            }
                          }}
                        >
                          {status}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-1 rounded-md border border-slate-200 dark:border-slate-800">
                  <span className="text-sm text-slate-500 pl-2">Priority</span>
                  <Select value={filterPriority} onValueChange={(val: any) => setFilterPriority(val)}>
                    <SelectTrigger className="w-[120px] border-none bg-transparent shadow-none focus:ring-0">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Priorities</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Right Side: Actions */}
            <div className="flex flex-row xl:flex-col items-center xl:items-end justify-between xl:justify-start gap-3 w-full xl:w-auto mt-2 xl:mt-0">
              <Button variant="outline" onClick={fetchTasks} disabled={loading} className="gap-2 w-full xl:w-auto h-10 px-4">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {user?.role !== "Viewer" && (
                <Button className="gap-2 bg-ci-green hover:bg-ci-green/90 text-white w-full xl:w-auto h-10 px-4" onClick={handleAddNew}>
                  <PlusCircle className="w-4 h-4" />
                  Add Task
                </Button>
              )}
            </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-slate-500">Loading dashboard data...</div>
        ) : (
          <>
            <Scorecards tasks={filteredTasks} />
            <Charts tasks={filteredTasks} />
            <GanttChart 
              tasks={filteredTasks} 
              dateRange={{ start: new Date(dateRange.start), end: new Date(dateRange.end) }} 
              onEditTask={user?.role !== "Viewer" ? handleEdit : undefined}
            />
            <TaskTable tasks={filteredTasks} currentUser={user} onEditTask={handleEdit} onDeleteTask={handleDeleteTask} />
          </>
        )}

        {/* Task Form Modal */}
        {isFormOpen && (
          <TaskForm 
            open={isFormOpen} 
            onOpenChange={setIsFormOpen} 
            task={editingTask} 
            onSave={handleSaveTask}
            fixedWebsites={user?.role === "Site Team Member" ? user?.assignedWebsites : undefined}
            isManager={user?.role === "Manager"}
            currentUser={user || undefined}
            availableWebsites={Array.from(new Set(tasks.map(t => t.Website_Name)))}
            allTasks={tasks}
          />
        )}
    </div>
  );
}
