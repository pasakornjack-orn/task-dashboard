import { NextResponse } from "next/server";
import { fetchGoogleSheetUsers } from "@/lib/services/google-sheets";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    
    const rows = await fetchGoogleSheetUsers();
    if (!rows) return NextResponse.json({ error: "Google Sheets not configured" }, { status: 500 });
    
    // User columns: 0:id, 1:username, 2:password, 3:name, 4:role, 5:assignedWebsites
    const userRow = rows.find(r => r[1] === username && r[2] === password);
    
    if (userRow) {
      return NextResponse.json({
        id: userRow[0],
        username: userRow[1],
        name: userRow[3],
        role: userRow[4],
        assignedWebsites: userRow[5] ? JSON.parse(userRow[5]) : []
      });
    }
    
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
