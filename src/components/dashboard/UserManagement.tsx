"use client";

import { useState, useEffect } from "react";
import { User, Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PlusCircle, KeyRound, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";

export function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  const [formData, setFormData] = useState({ username: "", password: "", name: "", role: "Site Team Member", assignedWebsites: [] as string[] });
  const [resetData, setResetData] = useState({ id: "", password: "" });
  const [editData, setEditData] = useState({ id: "", username: "", name: "", role: "Site Team Member", assignedWebsites: [] as string[] });
  const [error, setError] = useState("");
  const [availableWebsites, setAvailableWebsites] = useState<string[]>([]);
  const [isCustomAddWebsite, setIsCustomAddWebsite] = useState(false);
  const [customAddWebsite, setCustomAddWebsite] = useState("");
  const [isCustomEditWebsite, setIsCustomEditWebsite] = useState(false);
  const [customEditWebsite, setCustomEditWebsite] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchWebsites = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      const unique = Array.from(new Set(data.map((t: any) => t.Website_Name))) as string[];
      setAvailableWebsites(unique);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchWebsites();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const finalWebsites = isCustomAddWebsite && customAddWebsite ? [...formData.assignedWebsites, customAddWebsite] : formData.assignedWebsites;
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({...formData, assignedWebsites: finalWebsites})
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to add user");
        return;
      }
      setIsAddOpen(false);
      setFormData({ username: "", password: "", name: "", role: "Site Team Member", assignedWebsites: [] });
      setIsCustomAddWebsite(false);
      setCustomAddWebsite("");
      toast.success("User added successfully!");
      fetchUsers();
    } catch (e) {
      setError("An error occurred");
      toast.error("Failed to add user");
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resetData)
      });
      if (!res.ok) {
        setError("Failed to reset password");
        return;
      }
      setIsResetOpen(false);
      toast.success("Password reset successfully!");
    } catch (e) {
      setError("An error occurred");
      toast.error("Failed to reset password");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const finalWebsites = isCustomEditWebsite && customEditWebsite ? [...editData.assignedWebsites, customEditWebsite] : editData.assignedWebsites;
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({...editData, assignedWebsites: finalWebsites})
      });
      if (!res.ok) {
        setError("Failed to update user");
        return;
      }
      setIsEditOpen(false);
      setIsCustomEditWebsite(false);
      setCustomEditWebsite("");
      toast.success("User updated successfully!");
      fetchUsers();
    } catch (e) {
      setError("An error occurred");
      toast.error("Failed to update user");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await fetch(`/api/users?id=${id}`, { method: "DELETE" });
      toast.success("User deleted successfully!");
      fetchUsers();
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete user");
    }
  };

  if (loading) return <div className="py-10 text-center">Loading users...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-semibold">User Management</h2>
          <p className="text-sm text-slate-500">Manage dashboard access and permissions</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="bg-ci-green hover:bg-ci-green/90 text-white">
          <PlusCircle className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Assigned Website</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(u => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.username}</TableCell>
                <TableCell>{u.name}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    u.role === 'Manager' ? 'bg-purple-100 text-purple-700' : 
                    u.role === 'Viewer' ? 'bg-slate-100 text-slate-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {u.role}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {u.assignedWebsites && u.assignedWebsites.length > 0 ? (
                      u.assignedWebsites.map((w: string) => (
                        <span key={w} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs">{w}</span>
                      ))
                    ) : "-"}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setEditData({ 
                          id: u.id, 
                          username: u.username, 
                          name: u.name, 
                          role: u.role || "Site Team Member", 
                          assignedWebsites: u.assignedWebsites || [] 
                        });
                        setIsEditOpen(true);
                      }}
                    >
                      <Edit2 className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setResetData({ id: u.id, password: "" });
                        setIsResetOpen(true);
                      }}
                    >
                      <KeyRound className="w-4 h-4 mr-1" /> Reset
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(u.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add User Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            {error && <div className="text-red-500 text-sm">{error}</div>}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={formData.role} onValueChange={(v: any) => setFormData({...formData, role: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Site Team Member">Site Team Member</SelectItem>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {(formData.role === "Site Team Member" || formData.role === "Viewer") && (
                <div className="space-y-2 col-span-2">
                  <Label>Assigned Websites</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {availableWebsites.map(w => (
                      <label key={w} className="flex items-center space-x-2 bg-slate-50 border p-2 rounded-md cursor-pointer hover:bg-slate-100">
                        <input 
                          type="checkbox" 
                          checked={formData.assignedWebsites.includes(w)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({...formData, assignedWebsites: [...formData.assignedWebsites, w]});
                            } else {
                              setFormData({...formData, assignedWebsites: formData.assignedWebsites.filter(sw => sw !== w)});
                            }
                          }}
                          className="rounded border-slate-300 text-ci-green focus:ring-ci-green"
                        />
                        <span className="text-sm font-medium">{w}</span>
                      </label>
                    ))}
                  </div>
                  {isCustomAddWebsite ? (
                    <div className="flex gap-2">
                      <Input 
                        value={customAddWebsite} 
                        onChange={e => setCustomAddWebsite(e.target.value)} 
                        placeholder="Enter custom website" 
                      />
                      <Button type="button" variant="outline" onClick={() => {
                        setIsCustomAddWebsite(false);
                        setCustomAddWebsite("");
                      }}>X</Button>
                    </div>
                  ) : (
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsCustomAddWebsite(true)}>
                      + Add New Website
                    </Button>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit">Create User</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleResetSubmit} className="space-y-4">
            {error && <div className="text-red-500 text-sm">{error}</div>}
            
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="text" required value={resetData.password} onChange={e => setResetData({...resetData, password: e.target.value})} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsResetOpen(false)}>Cancel</Button>
              <Button type="submit">Update Password</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {error && <div className="text-red-500 text-sm">{error}</div>}
            
            <div className="space-y-2">
              <Label>Username</Label>
              <Input disabled value={editData.username} className="bg-slate-50 text-slate-500" />
            </div>

            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input required value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={editData.role} onValueChange={(v: any) => setEditData({...editData, role: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Site Team Member">Site Team Member</SelectItem>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {(editData.role === "Site Team Member" || editData.role === "Viewer") && (
                <div className="space-y-2 col-span-2">
                  <Label>Assigned Websites</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {availableWebsites.map(w => (
                      <label key={w} className="flex items-center space-x-2 bg-slate-50 border p-2 rounded-md cursor-pointer hover:bg-slate-100">
                        <input 
                          type="checkbox" 
                          checked={editData.assignedWebsites.includes(w)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditData({...editData, assignedWebsites: [...editData.assignedWebsites, w]});
                            } else {
                              setEditData({...editData, assignedWebsites: editData.assignedWebsites.filter(sw => sw !== w)});
                            }
                          }}
                          className="rounded border-slate-300 text-ci-green focus:ring-ci-green"
                        />
                        <span className="text-sm font-medium">{w}</span>
                      </label>
                    ))}
                  </div>
                  {isCustomEditWebsite ? (
                    <div className="flex gap-2">
                      <Input 
                        value={customEditWebsite} 
                        onChange={e => setCustomEditWebsite(e.target.value)} 
                        placeholder="Enter custom website" 
                      />
                      <Button type="button" variant="outline" onClick={() => {
                        setIsCustomEditWebsite(false);
                        setCustomEditWebsite("");
                      }}>X</Button>
                    </div>
                  ) : (
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsCustomEditWebsite(true)}>
                      + Add New Website
                    </Button>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-ci-green text-white hover:bg-ci-green/90">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
