import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Mail, Calendar, Clock, CheckCircle, XCircle } from "lucide-react";

interface ViewAdminDetailsDialogProps {
  admin: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ViewAdminDetailsDialog = ({ admin, open, onOpenChange }: ViewAdminDetailsDialogProps) => {
  if (!admin) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Admin Details</DialogTitle>
          <DialogDescription>
            Complete information about this administrator
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Name</p>
                <p className="font-medium">{admin.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <p className="font-medium flex items-center gap-2">
                  <Mail className="w-3 h-3" />
                  {admin.email}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Role & Status */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Role & Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Admin Role</p>
                <Badge variant={admin.admin_role === 'super_admin' ? 'destructive' : 'default'}>
                  {admin.admin_role.replace('_', ' ')}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <Badge variant={admin.is_active ? 'default' : 'destructive'} className="flex items-center gap-1 w-fit">
                  {admin.is_active ? (
                    <>
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3" />
                      Inactive
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Permissions */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Permissions</h3>
            <div>
              <Badge variant="outline">
                {Array.isArray(admin.permissions) && admin.permissions.length > 0 
                  ? `${admin.permissions.length} custom permissions` 
                  : "All permissions (full access)"}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Activity */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Activity
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Last Login
                </p>
                <p className="text-sm">
                  {admin.last_login ? new Date(admin.last_login).toLocaleString() : "Never"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Added On
                </p>
                <p className="text-sm">
                  {new Date(admin.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* System Info */}
          <Separator />
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">System Information</h3>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>User ID: {admin.user_id}</p>
              <p>Admin Record ID: {admin.id}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
