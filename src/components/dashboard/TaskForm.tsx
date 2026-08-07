"use client";

import { useState, useEffect } from "react";
import { Task, Status, Priority } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  onSave: (task: Partial<Task>) => void;
  fixedWebsites?: string[];
  isManager?: boolean;
  availableWebsites?: string[];
  allTasks?: Task[];
}

const DEFAULT_CATEGORIES = ["SEO Technical", "Content Marketing", "Website Development / WP", "Digital Ads / Campaign", "Graphic / Artwork", "Maintenance & Backup"];
const STATUSES: Status[] = ["To Do", "In Progress", "Under Review", "Done"];
const PRIORITIES: Priority[] = ["High", "Medium", "Low"];

export function TaskForm({ open, onOpenChange, task, onSave, fixedWebsites, isManager, availableWebsites = [], allTasks = [], currentUser }: TaskFormProps & { currentUser?: { name: string, role: string } }) {
  const [formData, setFormData] = useState<Partial<Task>>({});
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [isCustomWebsite, setIsCustomWebsite] = useState(false);
  const [customWebsite, setCustomWebsite] = useState("");
  const [isCustomMainTask, setIsCustomMainTask] = useState(false);
  const [customMainTask, setCustomMainTask] = useState("");

  const availableMainTasks = Array.from(new Set(allTasks.filter(t => t.Website_Name === formData.Website_Name && t.Main_Task).map(t => t.Main_Task)));

  useEffect(() => {
    if (open) {
      if (task) {
        setFormData(task);
        if (!DEFAULT_CATEGORIES.includes(task.Category)) {
          setIsCustomCategory(true);
          setCustomCategory(task.Category);
        } else {
          setIsCustomCategory(false);
        }
      } else {
        const randomId = `TSK-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        setFormData({
          Task_ID: randomId,
          Website_Name: (fixedWebsites && fixedWebsites.length === 1) ? fixedWebsites[0] : "",
          Assignee: currentUser?.name || "",
          Status: "To Do",
          Priority: "Medium",
          Category: "Content Marketing",
          Start_Date: new Date().toISOString().split('T')[0],
          Due_Date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
        setIsCustomCategory(false);
        setCustomCategory("");
        setIsCustomWebsite(false);
        setCustomWebsite("");
        setIsCustomMainTask(false);
        setCustomMainTask("");
      }
    }
  }, [task, fixedWebsites, open, currentUser]);

  const handleChange = (field: keyof Task, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (v: string) => {
    if (v === "CUSTOM") {
      setIsCustomCategory(true);
      handleChange("Category", "");
    } else {
      setIsCustomCategory(false);
      handleChange("Category", v);
    }
  };

  const handleWebsiteChange = (v: string) => {
    if (v === "CUSTOM") {
      setIsCustomWebsite(true);
      handleChange("Website_Name", "");
    } else {
      setIsCustomWebsite(false);
      handleChange("Website_Name", v);
    }
  };

  const handleMainTaskChange = (v: string) => {
    if (v === "CUSTOM") {
      setIsCustomMainTask(true);
      handleChange("Main_Task", "");
    } else {
      setIsCustomMainTask(false);
      handleChange("Main_Task", v);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      Category: isCustomCategory ? customCategory : formData.Category,
      Website_Name: isCustomWebsite ? customWebsite : formData.Website_Name,
      Main_Task: isCustomMainTask ? customMainTask : formData.Main_Task
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-950">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Add New Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Task ID</Label>
              <Input 
                required 
                value={formData.Task_ID || ""} 
                onChange={e => handleChange("Task_ID", e.target.value)} 
                disabled={!!task} // Cannot edit ID of existing task
              />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              {fixedWebsites && fixedWebsites.length === 1 ? (
                <Input 
                  required 
                  value={formData.Website_Name || ""} 
                  onChange={e => handleChange("Website_Name", e.target.value)}
                  disabled // Locked if user is Site Team and has only 1 website
                />
              ) : isCustomWebsite ? (
                <div className="flex gap-2">
                  <Input 
                    required 
                    value={customWebsite} 
                    onChange={e => setCustomWebsite(e.target.value)} 
                    placeholder="Enter custom website" 
                  />
                  <Button type="button" variant="outline" onClick={() => setIsCustomWebsite(false)}>X</Button>
                </div>
              ) : (
                <Select value={formData.Website_Name} onValueChange={(v: any) => handleWebsiteChange(v)}>
                  <SelectTrigger><SelectValue placeholder="Select a website" /></SelectTrigger>
                  <SelectContent>
                    {(fixedWebsites && fixedWebsites.length > 0 ? fixedWebsites : availableWebsites).map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                    {isManager && <SelectItem value="CUSTOM" className="font-bold text-blue-600">+ Add New Website</SelectItem>}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Main Task (Parent)</Label>
            {isCustomMainTask ? (
              <div className="flex gap-2">
                <Input 
                  required 
                  value={customMainTask} 
                  onChange={e => setCustomMainTask(e.target.value)} 
                  placeholder="e.g. SEO Audit ประจำเดือน" 
                />
                <Button type="button" variant="outline" onClick={() => setIsCustomMainTask(false)}>X</Button>
              </div>
            ) : (
              <Select value={formData.Main_Task || ""} onValueChange={(v: any) => handleMainTaskChange(v)}>
                <SelectTrigger><SelectValue placeholder={formData.Website_Name ? "Select a main task" : "Select website first"} /></SelectTrigger>
                <SelectContent>
                  {availableMainTasks.map(mt => <SelectItem key={mt} value={mt}>{mt}</SelectItem>)}
                  <SelectItem value="CUSTOM" className="font-bold text-blue-600">+ Add New Main Task</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>Sub Task Name</Label>
            <Input required value={formData.Task_Name || ""} onChange={e => handleChange("Task_Name", e.target.value)} placeholder="e.g. ตรวจสอบ Broken Links" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              {isCustomCategory ? (
                <div className="flex gap-2">
                  <Input 
                    required 
                    value={customCategory} 
                    onChange={e => setCustomCategory(e.target.value)} 
                    placeholder="Enter custom category" 
                  />
                  <Button type="button" variant="outline" onClick={() => setIsCustomCategory(false)}>X</Button>
                </div>
              ) : (
                <Select value={formData.Category} onValueChange={(v: any) => handleCategoryChange(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DEFAULT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    {isManager && <SelectItem value="CUSTOM" className="font-bold text-blue-600">+ Add New Category</SelectItem>}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label>Assignee</Label>
              <Input 
                required 
                value={formData.Assignee || ""} 
                onChange={e => handleChange("Assignee", e.target.value)} 
                placeholder="e.g. นาย A" 
                disabled={!isManager} // Locked for non-managers
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.Status} onValueChange={(v: any) => handleChange("Status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={formData.Priority} onValueChange={(v: any) => handleChange("Priority", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" required value={formData.Start_Date || ""} onChange={e => handleChange("Start_Date", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" required value={formData.Due_Date || ""} onChange={e => handleChange("Due_Date", e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Remarks / Notes</Label>
            <Input value={formData.Checklist_Remarks || ""} onChange={e => handleChange("Checklist_Remarks", e.target.value)} placeholder="Optional notes..." />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Save Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
