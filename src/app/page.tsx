"use client";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { LogIn, Mail } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }
    const success = await login(username, password);
    if (!success) {
      setError("Invalid username or password");
    }
  };

  const [isResetting, setIsResetting] = useState(false);

  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast.error("Please enter a valid username/email.");
      return;
    }
    
    setIsResetting(true);
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: resetEmail })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to send reset link");
      }
      
      toast.success(`Temporary password has been sent to ${resetEmail}`);
      setIsResetOpen(false);
      setResetEmail("");
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-ci-blue/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-ci-yellow/20 rounded-full blur-[120px] pointer-events-none" />
      
      <Card className="w-full max-w-md shadow-2xl border-white/20 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl">
        <CardHeader className="space-y-2 text-center pt-10 pb-8 px-8">
          <div className="w-16 h-16 bg-ci-green rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-ci-green/30">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Executive Dashboard</CardTitle>
          <CardDescription className="text-base">
            Sign in to manage tasks and track progress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-8 pb-10">
          <div className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
              <Input 
                type="text"
                placeholder="Enter your username"
                className="h-12"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
                  <DialogTrigger>
                    <button className="text-sm text-ci-blue hover:underline font-medium focus:outline-none">
                      Forgot password?
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Reset Password</DialogTitle>
                      <DialogDescription>
                        Enter your email address and we&apos;ll send you a link to reset your password.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center space-x-2 py-4">
                      <div className="grid flex-1 gap-2">
                        <label htmlFor="email" className="sr-only">
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                          <Input
                            id="email"
                            type="text"
                            placeholder="Enter your username"
                            className="pl-10 h-11"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()}
                          />
                        </div>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-ci-blue hover:bg-ci-blue/90 text-white" 
                      onClick={handleResetPassword}
                      disabled={isResetting}
                    >
                      {isResetting ? "Sending..." : "Send Reset Link"}
                    </Button>
                  </DialogContent>
                </Dialog>
              </div>
              <Input 
                type="password"
                placeholder="Enter your password"
                className="h-12"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
          </div>

          <Button 
            className="w-full h-12 text-base font-semibold shadow-lg bg-ci-green hover:bg-ci-green/90 shadow-ci-green/20 transition-all hover:shadow-ci-green/40 hover:-translate-y-0.5" 
            size="lg" 
            onClick={handleLogin}
          >
            Sign In to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
