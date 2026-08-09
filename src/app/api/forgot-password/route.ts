import { NextResponse } from "next/server";
import { Resend } from "resend";
import { fetchGoogleSheetUsers, updateGoogleSheetUser } from "@/lib/services/google-sheets";

export async function POST(request: Request) {
  try {
    // Initialize inside the handler to prevent build errors when env is missing
    const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");
    
    const { username } = await request.json();
    
    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    const rows = await fetchGoogleSheetUsers();
    if (!rows) return NextResponse.json({ error: "Google Sheets not configured" }, { status: 500 });
    
    // Find the user by username
    const userIndex = rows.findIndex(r => r[1]?.toLowerCase() === username.toLowerCase());
    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userRow = rows[userIndex];
    // userRow is [id, username, password, name, role, assignedWebsites]
    
    // Generate a temporary 8-character password
    const tempPassword = Math.random().toString(36).slice(-8);
    
    // Update the sheet with the new password
    const updatedRow = [...userRow];
    updatedRow[2] = tempPassword; // Update password field
    
    const rowIndex = userIndex + 2; // +1 for 0-index, +1 for header
    await updateGoogleSheetUser(rowIndex, updatedRow);

    // Send email via Resend
    // NOTE: If using the free tier without a verified domain, 
    // the 'to' address must be the same as the one used to sign up for Resend.
    const emailTo = username; // Assuming username is an email
    
    const { data, error } = await resend.emails.send({
      from: "Task Dashboard <onboarding@resend.dev>",
      to: [emailTo],
      subject: "Password Reset - Task Dashboard",
      html: `
        <div>
          <h2>Hello ${userRow[3]},</h2>
          <p>Your password for the Task Dashboard has been reset.</p>
          <p>Your new temporary password is: <strong>${tempPassword}</strong></p>
          <p>Please login and change your password immediately from the Settings icon in the top right corner.</p>
          <br />
          <p>Thanks,<br/>Task Dashboard Team</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send email. Ensure your Resend account is verified." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Temporary password sent to email" });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
