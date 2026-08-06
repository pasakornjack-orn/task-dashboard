"use client";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
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
