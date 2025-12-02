import { useState, useEffect } from "react";
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

interface EditLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: { id: number; name: string; site_id: number } | null;
}

export function EditLocationDialog({ open, onOpenChange, location }: EditLocationDialogProps) {
  const [name, setName] = useState("");
  const [siteId, setSiteId] = useState<string>("");
  const queryClient = useQueryClient();
  const { sites } = useAssetSetupConfig();

  useEffect(() => {
    if (open && location) {
      setName(location.name || "");
      setSiteId(location.site_id?.toString() || "");
    }
  }, [open, location]);

  const updateLocation = useMutation({
    mutationFn: async () => {
      if (!location) throw new Error("No location selected");

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
        .update({
          name: name.trim(),
          site_id: siteId ? parseInt(siteId) : null,
        })
        .eq("id", location.id)
        .eq("organisation_id", userData.organisation_id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Location updated successfully");
      queryClient.invalidateQueries({ queryKey: ["itam-locations"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to update location: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a location name");
      return;
    }
    updateLocation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Location</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-location-name">Location Name</Label>
              <Input
                id="edit-location-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter location name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location-site">Site</Label>
              <Select value={siteId} onValueChange={setSiteId}>
                <SelectTrigger id="edit-location-site">
                  <SelectValue placeholder="Select site" />
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
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateLocation.isPending}>
              {updateLocation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
