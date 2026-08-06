import { Task } from "../types";

// Initial mock data
let mockTasks: Task[] = [
  {
    Task_ID: "BNH-001",
    Website_Name: "BNH Hospital",
    Main_Task: "บทความแผนกเด็ก 10 บทความ",
    Task_Name: "บทความที่ 1: โรคไอหวัดในเด็กเล็ก",
    Category: "Content Marketing",
    Assignee: "นาย A",
    Status: "Done",
    Priority: "Medium",
    Start_Date: "2026-08-01",
    Due_Date: "2026-08-05",
    Completed_Date: "2026-08-04",
  },
  {
    Task_ID: "BNH-002",
    Website_Name: "BNH Hospital",
    Main_Task: "บทความแผนกเด็ก 10 บทความ",
    Task_Name: "บทความที่ 2: วัคซีนที่จำเป็นสำหรับเด็ก",
    Category: "Content Marketing",
    Assignee: "นาย B",
    Status: "In Progress",
    Priority: "High",
    Start_Date: "2026-08-02",
    Due_Date: "2026-08-10",
  },
  {
    Task_ID: "BNH-003",
    Website_Name: "BNH Hospital",
    Main_Task: "SEO Audit ประจำเดือน",
    Task_Name: "ตรวจสอบ Broken Links",
    Category: "SEO Technical",
    Assignee: "นาย C",
    Status: "Under Review",
    Priority: "Medium",
    Start_Date: "2026-08-01",
    Due_Date: "2026-08-07",
  },
  {
    Task_ID: "BNH-004",
    Website_Name: "BNH Hospital",
    Main_Task: "ปรับปรุงหน้าแรก",
    Task_Name: "ออกแบบ Banner ใหม่",
    Category: "Graphic / Artwork",
    Assignee: "นางสาว D",
    Status: "To Do",
    Priority: "High",
    Start_Date: "2026-08-05",
    Due_Date: "2026-08-15",
    Checklist_Remarks: "รอรูปจากทางโรงพยาบาล",
  },
  {
    Task_ID: "SITEB-001",
    Website_Name: "Site B",
    Main_Task: "ทำ Google Ads",
    Task_Name: "Setup Campaign Search",
    Category: "Digital Ads / Campaign",
    Assignee: "นาย E",
    Status: "In Progress",
    Priority: "High",
    Start_Date: "2026-08-01",
    Due_Date: "2026-08-10",
  },
  {
    Task_ID: "SITEC-001",
    Website_Name: "Site C",
    Main_Task: "ดูแลระบบ",
    Task_Name: "Backup Database รายสัปดาห์",
    Category: "Maintenance & Backup",
    Assignee: "นาย A",
    Status: "To Do",
    Priority: "Low",
    Start_Date: "2026-08-10",
    Due_Date: "2026-08-10",
  },
];

export const mockDb = {
  getTasks: async (websiteName?: string): Promise<Task[]> => {
    if (websiteName && websiteName !== "All") {
      return mockTasks.filter(t => t.Website_Name === websiteName);
    }
    return mockTasks;
  },

  addTask: async (task: Task): Promise<Task> => {
    mockTasks.push(task);
    return task;
  },

  updateTask: async (taskId: string, updates: Partial<Task>): Promise<Task | null> => {
    const index = mockTasks.findIndex(t => t.Task_ID === taskId);
    if (index === -1) return null;
    
    mockTasks[index] = { ...mockTasks[index], ...updates };
    return mockTasks[index];
  },

  deleteTask: async (taskId: string): Promise<boolean> => {
    const initialLength = mockTasks.length;
    mockTasks = mockTasks.filter(t => t.Task_ID !== taskId);
    return mockTasks.length < initialLength;
  }
};
