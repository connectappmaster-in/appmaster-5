import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: { id: number; name: string; type: 'site' | 'location' | 'category' | 'department' | 'make' } | null;
}

export function DeleteConfirmDialog({ open, onOpenChange, item }: DeleteConfirmDialogProps) {
  const queryClient = useQueryClient();

  const deleteItem = useMutation({
    mutationFn: async () => {
      if (!item) throw new Error("No item selected");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: userData } = await supabase
        .from("users")
        .select("organisation_id")
        .eq("auth_user_id", user.id)
        .single();

      if (!userData?.organisation_id) throw new Error("Organization not found");

      let error;
      
      switch (item.type) {
        case 'site':
          ({ error } = await supabase
            .from('itam_sites')
            .delete()
            .eq("id", item.id)
            .eq("organisation_id", userData.organisation_id));
          break;
        case 'location':
          ({ error } = await supabase
            .from('itam_locations')
            .delete()
            .eq("id", item.id)
            .eq("organisation_id", userData.organisation_id));
          break;
        case 'category':
          ({ error } = await supabase
            .from('itam_categories')
            .delete()
            .eq("id", item.id)
            .eq("organisation_id", userData.organisation_id));
          break;
        case 'department':
          ({ error } = await supabase
            .from('itam_departments')
            .delete()
            .eq("id", item.id)
            .eq("organisation_id", userData.organisation_id));
          break;
        case 'make':
          ({ error } = await supabase
            .from('itam_makes')
            .delete()
            .eq("id", item.id)
            .eq("organisation_id", userData.organisation_id));
          break;
      }

      if (error) throw error;
    },
    onSuccess: () => {
      if (!item) return;
      
      toast.success(`${item.type.charAt(0).toUpperCase() + item.type.slice(1)} deleted successfully`);
      
      const queryKeyMap = {
        site: 'itam-sites',
        location: 'itam-locations',
        category: 'itam-categories',
        department: 'itam-departments',
        make: 'itam-makes',
      };
      
      queryClient.invalidateQueries({ queryKey: [queryKeyMap[item.type]] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to delete: " + error.message);
    },
  });

  const handleDelete = () => {
    deleteItem.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-full">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{item?.name}"? This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteItem.isPending}
          >
            {deleteItem.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
