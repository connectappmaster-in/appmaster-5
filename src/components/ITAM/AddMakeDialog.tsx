import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface AddMakeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddMakeDialog({ open, onOpenChange }: AddMakeDialogProps) {
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  const addMake = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: userData } = await supabase
        .from("users")
        .select("organisation_id")
        .eq("auth_user_id", user.id)
        .single();

      if (!userData?.organisation_id) throw new Error("Organization not found");

      const { error } = await supabase
        .from("itam_makes")
        .insert({
          tenant_id: 1,
          organisation_id: userData.organisation_id,
          code: name.trim().substring(0, 10).toUpperCase(),
          name: name.trim(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Make added successfully");
      queryClient.invalidateQueries({ queryKey: ["itam-makes"] });
      setName("");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to add make: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a make name");
      return;
    }
    addMake.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Make</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="make-name">Make Name</Label>
              <Input
                id="make-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Dell, HP, Lenovo, Apple"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addMake.isPending}>
              {addMake.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Make
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
