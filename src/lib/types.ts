export type Category = "SEO Technical" | "Content Marketing" | "Website Development / WP" | "Digital Ads / Campaign" | "Graphic / Artwork" | "Maintenance & Backup";
export type Status = "To Do" | "In Progress" | "Under Review" | "Done";
export type Priority = "High" | "Medium" | "Low";
export type Role = "Manager" | "Site Team Member" | "Viewer";

export interface User {
  id: string;
  name: string;
  role: Role;
  assignedWebsites?: string[]; // If Site Team Member, they only see these websites
}

export interface AuthUser extends User {
  username: string;
  password?: string;
}

export interface Task {
  Task_ID: string;
  Website_Name: string;
  Main_Task: string;
  Task_Name: string;
  Category: string; // Changed to string to allow custom categories
  Assignee: string;
  Status: Status;
  Priority: Priority;
  Start_Date: string; // YYYY-MM-DD
  Due_Date: string; // YYYY-MM-DD
  Completed_Date?: string;
  Checklist_Remarks?: string;
  CreatedBy?: string; // Track who created the task
}
