"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Role, AuthUser } from "./types";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: AuthUser | null;
  login: (username?: string, password?: string) => Promise<boolean | void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { mockUsers } from "./mock-users";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("mock_auth_user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const login = async (username?: string, password?: string) => {
    if (!username && !password) return false;

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      
      if (res.ok) {
        const foundUser = await res.json();
        const newUser: AuthUser = {
          id: foundUser.id,
          username: foundUser.username,
          name: foundUser.name,
          role: foundUser.role,
          assignedWebsites: foundUser.assignedWebsites,
        };
        setUser(newUser);
        localStorage.setItem("mock_auth_user", JSON.stringify(newUser));
        router.push("/dashboard");
        return true;
      }
    } catch (e) {
      console.error("Login failed", e);
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("mock_auth_user");
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
