import { NextResponse } from "next/server";
import { fetchGoogleSheetCategories, appendGoogleSheetCategory, deleteGoogleSheetCategoryRow, getSheetIdByName } from "@/lib/services/google-sheets";

export async function GET() {
  try {
    const rows = await fetchGoogleSheetCategories();
    
    if (!rows) {
      return NextResponse.json({ error: "Google Sheets not configured" }, { status: 500 });
    }

    const categories = rows.map((row: any, index: number) => ({
      id: `cat-${index}`,
      Website_Name: row[0],
      Category_Name: row[1],
      rowIndex: index + 2, // Accounting for header
    }));

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Failed to fetch categories", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { Website_Name, Category_Name } = data;
    
    if (!Website_Name || !Category_Name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    await appendGoogleSheetCategory([Website_Name, Category_Name]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to append category", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rowIndexStr = searchParams.get("rowIndex");
    
    if (!rowIndexStr) {
      return NextResponse.json({ error: "Missing rowIndex parameter" }, { status: 400 });
    }

    const rowIndex = parseInt(rowIndexStr, 10);
    const sheetId = await getSheetIdByName("Categories");
    
    if (sheetId === null || sheetId === undefined) {
      return NextResponse.json({ error: "Could not find Categories sheet ID" }, { status: 500 });
    }
    
    await deleteGoogleSheetCategoryRow(sheetId, rowIndex);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete category", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
