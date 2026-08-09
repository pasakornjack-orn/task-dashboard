"use client";

import { useAuth } from "@/lib/auth-context";
import { UserManagement } from "@/components/dashboard/UserManagement";
import { CategoryManagement } from "@/components/dashboard/CategoryManagement";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function UsersPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect if not Manager
  useEffect(() => {
    if (user && user.role !== "Manager") {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (user?.role !== "Manager") return null;

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h2>
        <p className="text-sm text-slate-500">Manage users and global configurations.</p>
      </div>

      <Tabs defaultValue="users" className="w-full flex flex-col">
        <TabsList className="flex flex-row h-10 w-fit items-center justify-start rounded-md bg-slate-100 dark:bg-slate-900 p-1 mb-6">
          <TabsTrigger value="users" className="px-4 py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm rounded-sm transition-all">
            User Management
          </TabsTrigger>
          <TabsTrigger value="categories" className="px-4 py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm rounded-sm transition-all">
            Category Management
          </TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="mt-0">
          <UserManagement />
        </TabsContent>
        <TabsContent value="categories" className="mt-0">
          <CategoryManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
