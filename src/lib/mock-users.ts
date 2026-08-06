import { User, Role } from "./types";

// In-memory store for users
export let mockUsers = [
  { id: "1", username: "admin", password: "password", name: "Executive Admin", role: "Manager" as Role, assignedWebsites: [] as string[] },
  { id: "2", username: "bnh", password: "password", name: "Staff (BNH)", role: "Site Team Member" as Role, assignedWebsites: ["BNH Hospital"] },
  { id: "3", username: "siteb", password: "password", name: "Staff (Site B)", role: "Site Team Member" as Role, assignedWebsites: ["Site B"] },
  { id: "4", username: "sitec", password: "password", name: "Staff (Site C)", role: "Site Team Member" as Role, assignedWebsites: ["Site C"] },
  { id: "5", username: "viewer", password: "password", name: "Executive Viewer", role: "Viewer" as Role, assignedWebsites: [] as string[] },
];

export const setMockUsers = (users: any[]) => {
  mockUsers = users;
};
