import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, Search, Trash2, Download, Ban, CheckCircle, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AddIndividualUserDialog } from "./AddIndividualUserDialog";
import { UserDetailsModal } from "./UserDetailsModal";
import { ResetPasswordDialog } from "./ResetPasswordDialog";

export const IndividualUsersTable = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchParams] = useSearchParams();
  const orgFilter = searchParams.get("org");
  const navigate = useNavigate();
  
  // User details modal state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetailsModalOpen, setUserDetailsModalOpen] = useState(false);
  
  // Dialog states
  const [updateNameDialog, setUpdateNameDialog] = useState<{open: boolean, user: any | null}>({open: false, user: null});
  const [updateStatusDialog, setUpdateStatusDialog] = useState<{open: boolean, user: any | null}>({open: false, user: null});
  const [updateEmailDialog, setUpdateEmailDialog] = useState<{open: boolean, user: any | null}>({open: false, user: null});
  const [deleteDialog, setDeleteDialog] = useState<{open: boolean, user: any | null}>({open: false, user: null});
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{open: boolean, user: any | null}>({open: false, user: null});
  const [newName, setNewName] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [newEmail, setNewEmail] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [orgFilter]);

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
        .eq("user_type", "individual");

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
        account_type: user.organisations?.account_type || "personal",
        global_status: user.status,
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

  const handleUpdateName = async () => {
    if (!updateNameDialog.user || !newName.trim()) return;
    
    try {
      const { error } = await supabase
        .from("users")
        .update({ name: newName.trim() })
        .eq("id", updateNameDialog.user.id);
      
      if (error) throw error;
      toast.success("User name updated successfully");
      setUpdateNameDialog({open: false, user: null});
      setNewName("");
      fetchUsers();
    } catch (error: any) {
      toast.error("Failed to update name: " + error.message);
    }
  };

  const handleUpdateStatus = async () => {
    if (!updateStatusDialog.user || !newStatus) return;
    
    try {
      const { error } = await supabase
        .from("users")
        .update({ status: newStatus })
        .eq("id", updateStatusDialog.user.id);
      
      if (error) throw error;
      toast.success("User status updated successfully");
      setUpdateStatusDialog({open: false, user: null});
      setNewStatus("");
      fetchUsers();
    } catch (error: any) {
      toast.error("Failed to update status: " + error.message);
    }
  };

  const handleUpdateEmail = async () => {
    if (!updateEmailDialog.user || !newEmail.trim()) return;
    
    try {
      const { error } = await supabase
        .from("users")
        .update({ email: newEmail.trim() })
        .eq("id", updateEmailDialog.user.id);
      
      if (error) throw error;
      toast.success("User email updated successfully");
      setUpdateEmailDialog({open: false, user: null});
      setNewEmail("");
      fetchUsers();
    } catch (error: any) {
      toast.error("Failed to update email: " + error.message);
    }
  };

  const handleSuspendUser = async (user: any) => {
    try {
      const newStatus = user.status === "suspended" ? "active" : "suspended";
      const { error } = await supabase
        .from("users")
        .update({ status: newStatus })
        .eq("id", user.id);
      
      if (error) throw error;
      toast.success(`User ${newStatus === "suspended" ? "suspended" : "activated"} successfully`);
      fetchUsers();
    } catch (error: any) {
      toast.error("Failed to update user status: " + error.message);
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
      ["Name", "Email", "Type", "Organisation", "Status", "Created"],
      ...selectedUsersData.map(u => [
        u.name || "-",
        u.email,
        u.user_type,
        u.organisation_name,
        u.status,
        new Date(u.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `individual-users-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success(`Exported ${selectedUsers.size} user(s)`);
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
    setUserDetailsModalOpen(true);
  };

  return (
    <>
      <UserDetailsModal 
        userId={selectedUserId}
        open={userDetailsModalOpen}
        onOpenChange={setUserDetailsModalOpen}
        onRefresh={fetchUsers}
      />
      
      <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative w-[30%]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search individual users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={fetchUsers} variant="outline" size="sm">
          Refresh
        </Button>
        <Button size="sm" onClick={() => setShowAddDialog(true)}>
          <UserPlus className="w-4 h-4 mr-1" />
          Add User
        </Button>
      </div>

      <AddIndividualUserDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onUserAdded={fetchUsers}
      />

      {selectedUsers.size > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border animate-in slide-in-from-top-2 duration-200">
          <span className="text-sm font-medium">{selectedUsers.size} selected</span>
          <div className="flex gap-2 ml-auto">
            <Button size="sm" variant="outline" onClick={handleBulkExport}>
              <Download className="w-4 h-4 mr-1" />
              Export
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
                  {searchTerm ? "No users found matching your search" : "No individual users found"}
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
                  <TableCell className="font-medium">
                    <button 
                      onClick={() => handleUserClick(user.id)}
                      className="text-primary hover:underline hover:text-primary/80 transition-colors"
                    >
                      {user.name || "-"}
                    </button>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className="text-sm">{user.organisation_name}</span>
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
                          setUpdateNameDialog({open: true, user});
                          setNewName(user.name || "");
                        }}>
                          Update Name
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setUpdateEmailDialog({open: true, user});
                          setNewEmail(user.email || "");
                        }}>
                          Update Email
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setUpdateStatusDialog({open: true, user});
                          setNewStatus(user.status);
                        }}>
                          Update Status
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSuspendUser(user)}>
                          {user.status === "suspended" ? "Activate User" : "Suspend User"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                          Reset Password
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

      {/* Update Name Dialog */}
      <Dialog open={updateNameDialog.open} onOpenChange={(open) => !open && setUpdateNameDialog({open: false, user: null})}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update User Name</DialogTitle>
            <DialogDescription>
              Update the name for {updateNameDialog.user?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter new name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateNameDialog({open: false, user: null})}>
              Cancel
            </Button>
            <Button onClick={handleUpdateName}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Email Dialog */}
      <Dialog open={updateEmailDialog.open} onOpenChange={(open) => !open && setUpdateEmailDialog({open: false, user: null})}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update User Email</DialogTitle>
            <DialogDescription>
              Update the email for {updateEmailDialog.user?.name || updateEmailDialog.user?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateEmailDialog({open: false, user: null})}>
              Cancel
            </Button>
            <Button onClick={handleUpdateEmail}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={updateStatusDialog.open} onOpenChange={(open) => !open && setUpdateStatusDialog({open: false, user: null})}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update User Status</DialogTitle>
            <DialogDescription>
              Update the status for {updateStatusDialog.user?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateStatusDialog({open: false, user: null})}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus}>Update</Button>
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

      {/* Reset Password Dialog */}
      <ResetPasswordDialog
        open={resetPasswordDialog.open}
        onOpenChange={(open) => !open && setResetPasswordDialog({open: false, user: null})}
        user={resetPasswordDialog.user}
        onSuccess={fetchUsers}
      />
    </div>
    </>
  );
};
