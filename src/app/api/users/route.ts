import { NextResponse } from "next/server";
import { 
  fetchGoogleSheetUsers, 
  appendGoogleSheetUser, 
  updateGoogleSheetUser, 
  deleteGoogleSheetUserRow,
  getSheetIdByName
} from "@/lib/services/google-sheets";
import { User, Role, AuthUser } from "@/lib/types";

// Helper to convert sheet row array to User object
const mapRowToUser = (row: any[]): AuthUser => {
  return {
    id: row[0],
    username: row[1],
    password: row[2],
    name: row[3],
    role: row[4] as Role,
    assignedWebsites: row[5] ? JSON.parse(row[5]) : []
  };
};

export async function GET() {
  try {
    const rows = await fetchGoogleSheetUsers();
    if (!rows) return NextResponse.json({ error: "Google Sheets not configured" }, { status: 500 });
    
    const users = rows.map(mapRowToUser);
    
    // We omit password in GET /api/users for security, just like before
    return NextResponse.json(users.map(u => ({
      id: u.id,
      username: u.username,
      name: u.name,
      role: u.role,
      assignedWebsites: u.assignedWebsites
    })));
  } catch (error) {
    console.error("Failed to fetch users", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const rows = await fetchGoogleSheetUsers();
    if (!rows) return NextResponse.json({ error: "Google Sheets not configured" }, { status: 500 });
    
    // Simple validation for unique username
    if (rows.some(r => r[1] === data.username)) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 });
    }

    const newUser = {
      id: Math.random().toString(36).substring(2, 9),
      ...data
    };
    
    const newRow = [
      newUser.id,
      newUser.username,
      newUser.password || "password",
      newUser.name,
      newUser.role,
      JSON.stringify(newUser.assignedWebsites || [])
    ];
    
    await appendGoogleSheetUser(newRow);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Failed to create user", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, password, role, assignedWebsites, name } = data;
    
    const rows = await fetchGoogleSheetUsers();
    if (!rows) return NextResponse.json({ error: "Google Sheets not configured" }, { status: 500 });
    
    const rowIndex = rows.findIndex(r => r[0] === id);
    if (rowIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // A2 is row 2, so index 0 -> row 2. rowIndex -> rowIndex + 2
    const sheetRowIndex = rowIndex + 2;
    const oldRow = rows[rowIndex];
    
    const newRow = [
      oldRow[0], // id
      oldRow[1], // username
      password !== undefined ? password : oldRow[2],
      name !== undefined ? name : oldRow[3],
      role !== undefined ? role : oldRow[4],
      assignedWebsites !== undefined ? JSON.stringify(assignedWebsites) : oldRow[5]
    ];
    
    await updateGoogleSheetUser(sheetRowIndex, newRow);
    return NextResponse.json(mapRowToUser(newRow));
  } catch (error) {
    console.error("Failed to update user", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const rows = await fetchGoogleSheetUsers();
    if (!rows) return NextResponse.json({ error: "Google Sheets not configured" }, { status: 500 });
    
    const rowIndex = rows.findIndex(r => r[0] === id);
    if (rowIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    const sheetId = await getSheetIdByName("Users");
    if (sheetId === null || sheetId === undefined) {
      return NextResponse.json({ error: "Sheet not found" }, { status: 500 });
    }
    
    // A2 is row 2, so index 0 -> row 2. rowIndex -> rowIndex + 2
    await deleteGoogleSheetUserRow(sheetId, rowIndex + 2);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete user", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
