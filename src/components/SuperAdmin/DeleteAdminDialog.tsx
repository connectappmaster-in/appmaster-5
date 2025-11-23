import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DeleteAdminDialogProps {
  admin: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const DeleteAdminDialog = ({ admin, open, onOpenChange, onSuccess }: DeleteAdminDialogProps) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!admin) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('appmaster_admins')
        .delete()
        .eq('id', admin.id);

      if (error) throw error;

      toast.success("Admin deleted successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(`Failed to delete admin: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the admin account for <strong>{admin?.email}</strong>.
            This action cannot be undone and will remove all admin privileges for this user.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Deleting..." : "Delete Admin"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
