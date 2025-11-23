import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, Search, Trash2, Download, Ban, CheckCircle, UserCog, Wrench } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AssignToolsDialog } from "./AssignToolsDialog";
import { useUserTools } from "@/hooks/useUserTools";
import { useAuth } from "@/contexts/AuthContext";
import { ResetPasswordDialog } from "./ResetPasswordDialog";

export const OrganizationUsersTable = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [searchParams] = useSearchParams();
  const orgFilter = searchParams.get("orgId");
  const navigate = useNavigate();
  const { user: currentAuthUser } = useAuth();
  const { bulkAssignTools } = useUserTools();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Dialog states
  const [changeRoleDialog, setChangeRoleDialog] = useState<{open: boolean, user: any | null}>({open: false, user: null});
  const [deleteDialog, setDeleteDialog] = useState<{open: boolean, user: any | null}>({open: false, user: null});
  const [assignToolsDialog, setAssignToolsDialog] = useState<{open: boolean, user: any | null}>({open: false, user: null});
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{open: boolean, user: any | null}>({open: false, user: null});
  const [newRole, setNewRole] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchCurrentUserId();
  }, [orgFilter]);

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
    setLoading(true);
    setError(null);
    try {
      // First get all appmaster admin user IDs to exclude them
      const { data: adminData } = await supabase
        .from("appmaster_admins")
        .select("user_id");
      
      const adminUserIds = adminData?.map(a => a.user_id) || [];

      let query = supabase
        .from("users")
        .select(`
          *,
          organisations!users_organisation_id_fkey (
            name,
            account_type
          )
        `)
        .eq("user_type", "organization");

      // Exclude appmaster admins
      if (adminUserIds.length > 0) {
        query = query.not("auth_user_id", "in", `(${adminUserIds.join(",")})`);
      }

      if (orgFilter) {
        query = query.eq("organisation_id", orgFilter);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      
      const transformedUsers = (data || []).map(user => ({
        ...user,
        organisation_name: user.organisations?.name || "No Organisation",
        account_type: user.organisations?.account_type || "organization",
      }));
      
      setUsers(transformedUsers);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      setError(error.message || "Failed to load users");
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
    if (!confirm(`Delete ${selectedUsers.size} user(s)?`)) return;
    
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
    const newStatus = user.status === "active" ? "suspended" : "active";
    
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

  const handleResetPassword = (user: any) => {
    setResetPasswordDialog({ open: true, user });
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
      ["Name", "Email", "Organisation", "Role", "Status", "Created"],
      ...selectedUsersData.map(u => [
        u.name || "-",
        u.email,
        u.organisation_name,
        u.role || "user",
        u.status,
        new Date(u.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `organization-users-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success(`Exported ${selectedUsers.size} user(s)`);
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search organization users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={fetchUsers} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {selectedUsers.size > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border animate-in slide-in-from-top-2 duration-200">
          <span className="text-sm font-medium">{selectedUsers.size} selected</span>
          <div className="flex gap-2 ml-auto">
            <Button size="sm" variant="outline" onClick={handleBulkExport}>
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <Button size="sm" variant="outline">
              <Wrench className="w-4 h-4 mr-1" />
              Assign Tools
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkStatusChange("inactive")}>
              <Ban className="w-4 h-4 mr-1" />
              Disable
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkStatusChange("active")}>
              <CheckCircle className="w-4 h-4 mr-1" />
              Enable
            </Button>
            <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
          {error}
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
              <TableHead>Organisation</TableHead>
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
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No users found matching your search" : "No organization users found"}
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
                    <span className="text-sm">{user.organisation_name}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.role || "user"}</Badge>
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
                        <DropdownMenuItem onClick={() => navigate(`/super-admin/users/${user.id}`)}>
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setChangeRoleDialog({open: true, user});
                          setNewRole(user.role || "");
                        }}>
                          Change Role
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setAssignToolsDialog({open: true, user})}>
                          <Wrench className="w-4 h-4 mr-2" />
                          Assign Tools
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                          Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                          {user.status === "active" ? "Deactivate" : "Activate"} User
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => setDeleteDialog({open: true, user})}
                        >
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
          onOpenChange={(open) => !open && setAssignToolsDialog({open: false, user: null})}
          user={assignToolsDialog.user}
          assignedBy={currentUserId}
        />
      )}

      {/* Reset Password Dialog */}
      <ResetPasswordDialog
        open={resetPasswordDialog.open}
        onOpenChange={(open) => !open && setResetPasswordDialog({open: false, user: null})}
        user={resetPasswordDialog.user}
        onSuccess={fetchUsers}
      />
    </div>
  );
};
