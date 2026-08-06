import { NextResponse } from "next/server";
import { 
  fetchGoogleSheetTasks, 
  appendGoogleSheetTask, 
  updateGoogleSheetTask, 
  deleteGoogleSheetTaskRow,
  getSheetIdByName
} from "@/lib/services/google-sheets";
import { Task } from "@/lib/types";

// Helper to convert sheet row array to Task object
// 'id', 'Task_Name', 'Website_Name', 'Assignee', 'Status', 'Priority', 'Start_Date', 'End_Date', 'Notes'
const mapRowToTask = (row: any[]): Task => {
  return {
    Task_ID: row[0],
    Task_Name: row[1],
    Website_Name: row[2],
    Assignee: row[3],
    Status: row[4],
    Priority: row[5],
    Start_Date: row[6],
    End_Date: row[7],
    Notes: row[8] || ""
  };
};

export async function GET(request: Request) {
  try {
    const rows = await fetchGoogleSheetTasks();
    if (!rows) return NextResponse.json({ error: "Google Sheets not configured" }, { status: 500 });
    
    let tasks = rows.map(mapRowToTask);
    
    const { searchParams } = new URL(request.url);
    const website = searchParams.get("website");
    if (website) {
      tasks = tasks.filter(t => t.Website_Name === website);
    }
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Failed to fetch tasks", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: Task = await request.json();
    const rows = await fetchGoogleSheetTasks();
    if (!rows) return NextResponse.json({ error: "Google Sheets not configured" }, { status: 500 });
    
    // Auto-increment ID based on highest existing ID
    let maxId = 0;
    rows.forEach(r => {
      const id = parseInt(r[0]);
      if (!isNaN(id) && id > maxId) maxId = id;
    });
    
    const newTask = {
      ...body,
      Task_ID: (maxId + 1).toString()
    };
    
    const newRow = [
      newTask.Task_ID,
      newTask.Task_Name,
      newTask.Website_Name,
      newTask.Assignee,
      newTask.Status,
      newTask.Priority,
      newTask.Start_Date,
      newTask.End_Date,
      newTask.Notes
    ];
    
    await appendGoogleSheetTask(newRow);
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Failed to add task", error);
    return NextResponse.json({ error: "Failed to add task" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body: Partial<Task> = await request.json();
    if (!body.Task_ID) {
      return NextResponse.json({ error: "Task_ID is required" }, { status: 400 });
    }
    
    const rows = await fetchGoogleSheetTasks();
    if (!rows) return NextResponse.json({ error: "Google Sheets not configured" }, { status: 500 });
    
    const rowIndex = rows.findIndex(r => r[0] === body.Task_ID);
    if (rowIndex === -1) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    
    const sheetRowIndex = rowIndex + 2; // Tasks!A2 is index 0
    const oldRow = rows[rowIndex];
    
    const newRow = [
      oldRow[0], // ID
      body.Task_Name !== undefined ? body.Task_Name : oldRow[1],
      body.Website_Name !== undefined ? body.Website_Name : oldRow[2],
      body.Assignee !== undefined ? body.Assignee : oldRow[3],
      body.Status !== undefined ? body.Status : oldRow[4],
      body.Priority !== undefined ? body.Priority : oldRow[5],
      body.Start_Date !== undefined ? body.Start_Date : oldRow[6],
      body.End_Date !== undefined ? body.End_Date : oldRow[7],
      body.Notes !== undefined ? body.Notes : (oldRow[8] || "")
    ];
    
    await updateGoogleSheetTask(sheetRowIndex, newRow);
    return NextResponse.json(mapRowToTask(newRow));
  } catch (error) {
    console.error("Failed to update task", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("id");
    
    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }
    
    const rows = await fetchGoogleSheetTasks();
    if (!rows) return NextResponse.json({ error: "Google Sheets not configured" }, { status: 500 });
    
    const rowIndex = rows.findIndex(r => r[0] === taskId);
    if (rowIndex === -1) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    
    const sheetId = await getSheetIdByName("Tasks");
    if (sheetId === null || sheetId === undefined) {
      return NextResponse.json({ error: "Sheet not found" }, { status: 500 });
    }
    
    await deleteGoogleSheetTaskRow(sheetId, rowIndex + 2);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete task", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
