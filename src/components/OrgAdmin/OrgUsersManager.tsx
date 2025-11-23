import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOrganisation } from "@/contexts/OrganisationContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, Search, Trash2, Download, Ban, CheckCircle, UserPlus, UserCog, Wrench, Key } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { AssignToolsDialog } from "../SuperAdmin/AssignToolsDialog";
import { useUserTools } from "@/hooks/useUserTools";
import { useAuth } from "@/contexts/AuthContext";
import { CreateUserDialog } from "./CreateUserDialog";

export const OrgUsersManager = () => {
  const { organisation } = useOrganisation();
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const { user: currentAuthUser } = useAuth();
  const { bulkAssignTools } = useUserTools();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Dialog states
  const [changeRoleDialog, setChangeRoleDialog] = useState<{open: boolean, user: any | null}>({open: false, user: null});
  const [deleteDialog, setDeleteDialog] = useState<{open: boolean, user: any | null}>({open: false, user: null});
  const [createUserDialog, setCreateUserDialog] = useState(false);
  const [assignToolsDialog, setAssignToolsDialog] = useState<{open: boolean, user: any | null}>({open: false, user: null});
  const [newRole, setNewRole] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchCurrentUserId();
  }, [organisation?.id]);

  const fetchCurrentUserId = async () => {
    if (!currentAuthUser) return;
    
    try {
      const { data } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", currentAuthUser.id)
        .single();
      
      if (data) {
        setCurrentUserId(data.id);
      }
    } catch (error) {
      console.error("Error fetching current user ID:", error);
    }
  };

  const fetchUsers = async () => {
    if (!organisation?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("organisation_id", organisation.id)
        .eq("user_type", "organization")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const toggleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return;
    if (!confirm(`Delete ${selectedUsers.size} user(s)? This action cannot be undone.`)) return;
    
    try {
      const { error } = await supabase
        .from("users")
        .delete()
        .in("id", Array.from(selectedUsers));
      
      if (error) throw error;
      toast.success(`Deleted ${selectedUsers.size} user(s)`);
      setSelectedUsers(new Set());
      fetchUsers();
    } catch (error: any) {
      toast.error("Failed to delete users: " + error.message);
    }
  };

  const handleBulkStatusChange = async (status: string) => {
    if (selectedUsers.size === 0) return;
    
    try {
      const { error } = await supabase
        .from("users")
        .update({ status })
        .in("id", Array.from(selectedUsers));
      
      if (error) throw error;
      toast.success(`Updated ${selectedUsers.size} user(s) to ${status}`);
      setSelectedUsers(new Set());
      fetchUsers();
    } catch (error: any) {
      toast.error("Failed to update users: " + error.message);
    }
  };

  const handleBulkRoleChange = async (role: string) => {
    if (selectedUsers.size === 0) return;
    if (!confirm(`Change role for ${selectedUsers.size} user(s) to ${role}?`)) return;
    
    try {
      const { error } = await supabase
        .from("users")
        .update({ role })
        .in("id", Array.from(selectedUsers));
      
      if (error) throw error;
      toast.success(`Updated ${selectedUsers.size} user(s) to role: ${role}`);
      setSelectedUsers(new Set());
      fetchUsers();
    } catch (error: any) {
      toast.error("Failed to update roles: " + error.message);
    }
  };

  const handleChangeRole = async () => {
    if (!changeRoleDialog.user || !newRole) return;
    
    try {
      const { error } = await supabase
        .from("users")
        .update({ role: newRole })
        .eq("id", changeRoleDialog.user.id);
      
      if (error) throw error;
      toast.success("User role updated successfully");
      setChangeRoleDialog({open: false, user: null});
      setNewRole("");
      fetchUsers();
    } catch (error: any) {
      toast.error("Failed to update role: " + error.message);
    }
  };

  const handleToggleStatus = async (user: any) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    
    try {
      const { error } = await supabase
        .from("users")
        .update({ status: newStatus })
        .eq("id", user.id);
      
      if (error) throw error;
      toast.success(`User ${newStatus === "active" ? "activated" : "deactivated"} successfully`);
      fetchUsers();
    } catch (error: any) {
      toast.error("Failed to update status: " + error.message);
    }
  };

  const handleResetPassword = async (user: any) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password-confirm`,
      });
      
      if (error) throw error;
      toast.success("Password reset email sent to " + user.email);
    } catch (error: any) {
      toast.error("Failed to send reset email: " + error.message);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteDialog.user) return;
    
    try {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", deleteDialog.user.id);
      
      if (error) throw error;
      toast.success("User deleted successfully");
      setDeleteDialog({open: false, user: null});
      fetchUsers();
    } catch (error: any) {
      toast.error("Failed to delete user: " + error.message);
    }
  };


  const handleBulkExport = () => {
    const selectedUsersData = users.filter(u => selectedUsers.has(u.id));
    const csv = [
      ["Name", "Email", "Role", "Status", "Last Login", "Created"],
      ...selectedUsersData.map(u => [
        u.name || "-",
        u.email,
        u.role || "user",
        u.status,
        u.last_login ? new Date(u.last_login).toLocaleDateString() : "Never",
        new Date(u.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success(`Exported ${selectedUsers.size} user(s)`);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="owner">Owner</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={() => setCreateUserDialog(true)} size="sm">
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
        
        <Button onClick={fetchUsers} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {selectedUsers.size > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border animate-in slide-in-from-top-2 duration-200">
          <span className="text-sm font-medium">{selectedUsers.size} selected</span>
          <div className="flex gap-2 ml-auto flex-wrap">
            <Button size="sm" variant="outline" onClick={handleBulkExport}>
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  <UserCog className="w-4 h-4 mr-1" />
                  Change Role
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleBulkRoleChange("owner")}>
                  Set as Owner
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkRoleChange("admin")}>
                  Set as Admin
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkRoleChange("manager")}>
                  Set as Manager
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkRoleChange("staff")}>
                  Set as Staff
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkRoleChange("viewer")}>
                  Set as Viewer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="outline">
              <Wrench className="w-4 h-4 mr-1" />
              Assign Tools
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkStatusChange("inactive")}>
              <Ban className="w-4 h-4 mr-1" />
              Deactivate
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkStatusChange("active")}>
              <CheckCircle className="w-4 h-4 mr-1" />
              Activate
            </Button>
            <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {searchTerm || roleFilter !== "all" || statusFilter !== "all" 
                    ? "No users found matching your filters" 
                    : "No users found. Invite your first team member!"}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.has(user.id)}
                      onCheckedChange={() => toggleSelectUser(user.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{user.name || "-"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{user.role || "user"}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === "active" ? "default" : "destructive"}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}
                  </TableCell>
                  <TableCell className="text-sm">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem onClick={() => {
                          setChangeRoleDialog({open: true, user});
                          setNewRole(user.role || "");
                        }}>
                          <UserCog className="w-4 h-4 mr-2" />
                          Change Role
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setAssignToolsDialog({open: true, user})}>
                          <Wrench className="w-4 h-4 mr-2" />
                          Assign Tools
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                          <Key className="w-4 h-4 mr-2" />
                          Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                          {user.status === "active" ? (
                            <>
                              <Ban className="w-4 h-4 mr-2" />
                              Deactivate User
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Activate User
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => setDeleteDialog({open: true, user})}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create User Dialog */}
      <CreateUserDialog
        open={createUserDialog}
        onOpenChange={setCreateUserDialog}
        onSuccess={fetchUsers}
      />

      {/* Change Role Dialog */}
      <Dialog open={changeRoleDialog.open} onOpenChange={(open) => !open && setChangeRoleDialog({open: false, user: null})}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for {changeRoleDialog.user?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangeRoleDialog({open: false, user: null})}>
              Cancel
            </Button>
            <Button onClick={handleChangeRole}>Update Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({open: false, user: null})}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deleteDialog.user?.email}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({open: false, user: null})}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Tools Dialog */}
      {assignToolsDialog.user && currentUserId && (
        <AssignToolsDialog
          open={assignToolsDialog.open}
          onOpenChange={(open) => {
            if (!open) {
              setAssignToolsDialog({open: false, user: null});
              fetchUsers(); // Refresh users after assigning tools
            }
          }}
          user={assignToolsDialog.user}
          assignedBy={currentUserId}
        />
      )}
    </div>
  );
};
