import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAssetSetupConfig } from "@/hooks/useAssetSetupConfig";

interface AddLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddLocationDialog({ open, onOpenChange }: AddLocationDialogProps) {
  const [name, setName] = useState("");
  const [siteId, setSiteId] = useState("");
  const queryClient = useQueryClient();
  const { sites } = useAssetSetupConfig();

  const addLocation = useMutation({
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
        .from("itam_locations")
        .insert({
          tenant_id: 1,
          organisation_id: userData.organisation_id,
          site_id: parseInt(siteId),
          name: name.trim(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Location added successfully");
      queryClient.invalidateQueries({ queryKey: ["itam-locations"] });
      setName("");
      setSiteId("");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to add location: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a location name");
      return;
    }
    if (!siteId) {
      toast.error("Please select a site");
      return;
    }
    addLocation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Location</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="location-site">Site</Label>
              <Select value={siteId} onValueChange={setSiteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id.toString()}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location-name">Location Name</Label>
              <Input
                id="location-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter location name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addLocation.isPending}>
              {addLocation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Location
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
