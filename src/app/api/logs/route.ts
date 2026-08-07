import { NextResponse } from "next/server";
import { fetchLoginLogs } from "@/lib/services/google-sheets";

export async function GET() {
  try {
    const rows = await fetchLoginLogs();
    
    if (!rows) {
      return NextResponse.json({ error: "Google Sheets not configured" }, { status: 500 });
    }

    const logs = rows.map((row: any) => ({
      id: row[0],
      timestamp: row[1],
      username: row[2],
      name: row[3],
      role: row[4]
    }));

    // Sort logs descending by timestamp
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Failed to fetch logs", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
