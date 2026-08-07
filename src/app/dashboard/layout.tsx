"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { LogOut, LayoutDashboard, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (newPassword.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }
    
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user?.id, password: newPassword })
      });
      
      if (!res.ok) throw new Error("Failed to update password");
      
      toast.success("Password updated successfully!");
      setIsPasswordModalOpen(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError("Failed to update password");
      toast.error("Failed to update password");
    }
  };

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          
          {/* Left section: Logo and Nav */}
          <div className="flex items-center">
            <div className="flex items-center gap-4 mr-8">
              <div className="flex items-center justify-center w-10 h-10 bg-ci-green rounded-lg shadow-sm shadow-ci-green/20">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Website Task Tracking</h1>
                <p className="text-xs text-slate-500 font-medium">Executive Dashboard</p>
              </div>
            </div>

            {user?.role === "Manager" && (
              <nav className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  className={`font-medium ${pathname === "/dashboard" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`} 
                  onClick={() => router.push("/dashboard")}
                >
                  Dashboard
                </Button>
                <Button 
                  variant="ghost" 
                  className={`font-medium ${pathname === "/dashboard/users" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`} 
                  onClick={() => router.push("/dashboard/users")}
                >
                  User Management
                </Button>
                <Button 
                  variant="ghost" 
                  className={`font-medium ${pathname === "/dashboard/logs" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`} 
                  onClick={() => router.push("/dashboard/logs")}
                >
                  Login Logs
                </Button>
              </nav>
            )}
          </div>
          
          {/* Right section: Profile */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-4">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user.name}</span>
              <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full mt-1">
                {user.role} {user.assignedWebsites && user.assignedWebsites.length > 0 ? `(${user.assignedWebsites.join(", ")})` : ''}
              </span>
            </div>
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900" onClick={() => setIsPasswordModalOpen(true)}>
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="sm" onClick={logout} className="gap-2">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
          
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Change Password Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4 pt-4">
            {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}
            
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input 
                type="password" 
                required 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                placeholder="Enter new password"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input 
                type="password" 
                required 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                placeholder="Confirm new password"
              />
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsPasswordModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-ci-green hover:bg-ci-green/90 text-white">Save Password</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
