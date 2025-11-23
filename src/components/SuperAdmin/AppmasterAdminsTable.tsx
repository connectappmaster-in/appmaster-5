import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, Search, Shield, Edit, Trash2, UserX, UserCheck, Eye, Key, ShieldCheck, Download, Ban, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditAdminDialog } from "./EditAdminDialog";
import { ViewAdminDetailsDialog } from "./ViewAdminDetailsDialog";
import { DeleteAdminDialog } from "./DeleteAdminDialog";
import { AddAdminDialog } from "./AddAdminDialog";
import { ResetPasswordDialog } from "./ResetPasswordDialog";

export const AppmasterAdminsTable = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAdmins, setSelectedAdmins] = useState<Set<string>>(new Set());
  
  // Dialog states
  const [selectedAdmin, setSelectedAdmin] = useState<any | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{open: boolean, user: any | null}>({open: false, user: null});

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      // Call the security definer function that returns admin details
      const { data, error: queryError } = await supabase
        .rpc("get_appmaster_admin_details");

      if (queryError) {
        console.error("Supabase error:", queryError);
        throw queryError;
      }
      
      console.log("Fetched appmaster admins:", data);
      setAdmins(data || []);
    } catch (error: any) {
      console.error("Error fetching appmaster admins:", error);
      setError(error.message || "Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  const filteredAdmins = admins.filter(admin =>
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedAdmins.size === filteredAdmins.length) {
      setSelectedAdmins(new Set());
    } else {
      setSelectedAdmins(new Set(filteredAdmins.map(a => a.id)));
    }
  };

  const toggleSelectAdmin = (adminId: string) => {
    const newSelected = new Set(selectedAdmins);
    if (newSelected.has(adminId)) {
      newSelected.delete(adminId);
    } else {
      newSelected.add(adminId);
    }
    setSelectedAdmins(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedAdmins.size === 0) return;
    if (!confirm(`Delete ${selectedAdmins.size} admin(s)?`)) return;
    
    try {
      const { error } = await supabase
        .from("appmaster_admins")
        .delete()
        .in("id", Array.from(selectedAdmins));
      
      if (error) throw error;
      toast.success(`Deleted ${selectedAdmins.size} admin(s)`);
      setSelectedAdmins(new Set());
      fetchAdmins();
    } catch (error: any) {
      toast.error("Failed to delete admins: " + error.message);
    }
  };

  const handleBulkStatusChange = async (isActive: boolean) => {
    if (selectedAdmins.size === 0) return;
    
    try {
      const { error } = await supabase
        .from("appmaster_admins")
        .update({ is_active: isActive })
        .in("id", Array.from(selectedAdmins));
      
      if (error) throw error;
      toast.success(`Updated ${selectedAdmins.size} admin(s) status`);
      setSelectedAdmins(new Set());
      fetchAdmins();
    } catch (error: any) {
      toast.error("Failed to update admins: " + error.message);
    }
  };

  const handleBulkExport = () => {
    const selectedAdminsData = admins.filter(a => selectedAdmins.has(a.id));
    const csv = [
      ["Name", "Email", "Role", "Status", "Last Login", "Created"],
      ...selectedAdminsData.map(a => [
        a.name || "-",
        a.email,
        a.admin_role,
        a.is_active ? "Active" : "Inactive",
        a.last_login ? new Date(a.last_login).toLocaleDateString() : "Never",
        new Date(a.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `appmaster-admins-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success(`Exported ${selectedAdmins.size} admin(s)`);
  };

  const handleEditAdmin = (admin: any) => {
    setSelectedAdmin(admin);
    setEditDialogOpen(true);
  };

  const handleToggleStatus = async (admin: any) => {
    try {
      const { error } = await supabase
        .from('appmaster_admins')
        .update({ is_active: !admin.is_active })
        .eq('id', admin.id);

      if (error) throw error;
      
      toast.success(`Admin ${admin.is_active ? 'deactivated' : 'activated'} successfully`);
      fetchAdmins();
    } catch (error: any) {
      toast.error(`Failed to update admin status: ${error.message}`);
    }
  };

  const handleDeleteAdmin = (admin: any) => {
    setSelectedAdmin(admin);
    setDeleteDialogOpen(true);
  };

  const handleViewDetails = (admin: any) => {
    setSelectedAdmin(admin);
    setViewDialogOpen(true);
  };

  const handleChangeRole = (admin: any) => {
    setSelectedAdmin(admin);
    setEditDialogOpen(true);
  };

  const handleResetPassword = (admin: any) => {
    setResetPasswordDialog({ 
      open: true, 
      user: {
        ...admin,
        auth_user_id: admin.user_id, // Map user_id to auth_user_id for admins
      }
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'destructive';
      case 'admin':
        return 'default';
      case 'viewer':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search AppMaster admins by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={fetchAdmins} variant="outline" size="sm">
          Refresh
        </Button>
        <Button size="sm" onClick={() => setAddDialogOpen(true)}>
          <UserPlus className="w-4 h-4 mr-1" />
          Add Admin
        </Button>
      </div>

      {selectedAdmins.size > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border animate-in slide-in-from-top-2 duration-200">
          <span className="text-sm font-medium">{selectedAdmins.size} selected</span>
          <div className="flex gap-2 ml-auto">
            <Button size="sm" variant="outline" onClick={handleBulkExport}>
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkStatusChange(false)}>
              <Ban className="w-4 h-4 mr-1" />
              Deactivate
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkStatusChange(true)}>
              <UserCheck className="w-4 h-4 mr-1" />
              Activate
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
                  checked={selectedAdmins.size === filteredAdmins.length && filteredAdmins.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Name
                </div>
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Admin Role</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Loading appmaster admins...
                </TableCell>
              </TableRow>
            ) : filteredAdmins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No admins found matching your search" : "No appmaster admins found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedAdmins.has(admin.id)}
                      onCheckedChange={() => toggleSelectAdmin(admin.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{admin.name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeColor(admin.admin_role)} className="capitalize">
                      {admin.admin_role.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {Array.isArray(admin.permissions) && admin.permissions.length > 0 
                        ? `${admin.permissions.length} custom` 
                        : "All"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={admin.is_active ? "default" : "destructive"}>
                      {admin.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {admin.last_login ? new Date(admin.last_login).toLocaleDateString() : "Never"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(admin.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewDetails(admin)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditAdmin(admin)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangeRole(admin)}>
                          <ShieldCheck className="w-4 h-4 mr-2" />
                          Change Role
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleResetPassword(admin)}>
                          <Key className="w-4 h-4 mr-2" />
                          Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(admin)}>
                          {admin.is_active ? (
                            <>
                              <UserX className="w-4 h-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-4 h-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteAdmin(admin)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Admin
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

      {/* Dialogs */}
      <EditAdminDialog
        admin={selectedAdmin}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={fetchAdmins}
      />
      
      <ViewAdminDetailsDialog
        admin={selectedAdmin}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />
      
      <DeleteAdminDialog
        admin={selectedAdmin}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={fetchAdmins}
      />

      <AddAdminDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={fetchAdmins}
      />

      <ResetPasswordDialog
        open={resetPasswordDialog.open}
        onOpenChange={(open) => !open && setResetPasswordDialog({open: false, user: null})}
        user={resetPasswordDialog.user}
        onSuccess={fetchAdmins}
      />
    </div>
  );
};
