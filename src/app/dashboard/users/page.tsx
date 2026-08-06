"use client";

import { useAuth } from "@/lib/auth-context";
import { UserManagement } from "@/components/dashboard/UserManagement";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
    <div className="animate-in fade-in duration-500">
      <UserManagement />
    </div>
  );
}
