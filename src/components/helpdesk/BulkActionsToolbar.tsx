import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Trash2, UserPlus, Edit3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BulkActionsToolbarProps {
  selectedIds: number[];
  onClearSelection: () => void;
}

export const BulkActionsToolbar = ({ selectedIds, onClearSelection }: BulkActionsToolbarProps) => {
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: users } = useQuery({
    queryKey: ['helpdesk-users'],
    queryFn: async () => {
      const { data } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('status', 'active')
        .order('name');
      return data || [];
    }
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ field, value }: { field: string; value: any }) => {
      const { error } = await supabase
        .from('helpdesk_tickets')
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .in('id', selectedIds);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['helpdesk-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['helpdesk-stats'] });
      toast.success(`Successfully updated ${selectedIds.length} ticket(s)`);
      onClearSelection();
    },
    onError: (error) => {
      toast.error('Failed to update tickets', {
        description: (error as Error).message
      });
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('helpdesk_tickets')
        .delete()
        .in('id', selectedIds);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['helpdesk-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['helpdesk-stats'] });
      toast.success(`Successfully deleted ${selectedIds.length} ticket(s)`);
      onClearSelection();
      setShowDeleteDialog(false);
    },
    onError: (error) => {
      toast.error('Failed to delete tickets', {
        description: (error as Error).message
      });
    }
  });

  return (
    <>
      <div className="flex items-center gap-3 p-4 bg-primary/10 border rounded-lg">
        <Badge variant="secondary" className="px-3 py-1">
          {selectedIds.length} selected
        </Badge>

        <div className="flex items-center gap-2 flex-1">
          <Select onValueChange={(value) => bulkUpdateMutation.mutate({ field: 'status', value })}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Change Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={(value) => bulkUpdateMutation.mutate({ field: 'priority', value })}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Change Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={(value) => bulkUpdateMutation.mutate({ field: 'assigned_to', value: value === 'unassign' ? null : value })}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Assign To" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassign">Unassign</SelectItem>
              {users?.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name || user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            disabled={bulkDeleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
        >
          <X className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.length} ticket(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected tickets
              and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => bulkDeleteMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {bulkDeleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
