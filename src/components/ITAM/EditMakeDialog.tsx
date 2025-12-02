import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface EditMakeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  make: { id: number; name: string } | null;
}

export function EditMakeDialog({ open, onOpenChange, make }: EditMakeDialogProps) {
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open && make) {
      setName(make.name || "");
    }
  }, [open, make]);

  const updateMake = useMutation({
    mutationFn: async () => {
      if (!make) throw new Error("No make selected");

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
        .update({ name: name.trim() })
        .eq("id", make.id)
        .eq("organisation_id", userData.organisation_id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Make updated successfully");
      queryClient.invalidateQueries({ queryKey: ["itam-makes"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to update make: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a make name");
      return;
    }
    updateMake.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Make</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-make-name">Make Name</Label>
              <Input
                id="edit-make-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter make name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMake.isPending}>
              {updateMake.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
