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

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-4 bg-slate-100 dark:bg-slate-900">
          <TabsTrigger value="users" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            User Management
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
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
