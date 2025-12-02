import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface AddSiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddSiteDialog({ open, onOpenChange }: AddSiteDialogProps) {
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  const addSite = useMutation({
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
        .from("itam_sites")
        .insert({
          tenant_id: 1,
          organisation_id: userData.organisation_id,
          code: name.trim().substring(0, 10).toUpperCase(),
          name: name.trim(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Site added successfully");
      queryClient.invalidateQueries({ queryKey: ["itam-sites"] });
      setName("");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to add site: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a site name");
      return;
    }
    addSite.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Site</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="site-name">Site Name</Label>
              <Input
                id="site-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter site name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addSite.isPending}>
              {addSite.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Site
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
