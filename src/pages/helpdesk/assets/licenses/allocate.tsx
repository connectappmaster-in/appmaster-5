import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganisation } from "@/contexts/OrganisationContext";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const AllocateLicense = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { organisation } = useOrganisation();
  const queryClient = useQueryClient();

  const [licenseId, setLicenseId] = useState(searchParams.get("licenseId") || "");
  const [userId, setUserId] = useState("");
  const [assetId, setAssetId] = useState("");

  const { data: licenses = [] } = useQuery({
    queryKey: ["itam-licenses-available", organisation?.id],
    queryFn: async () => {
      if (!organisation?.id) return [];
      const { data } = await supabase
        .from("itam_licenses")
        .select("*")
        .eq("organisation_id", organisation.id)
        .eq("is_deleted", false)
        .order("name");
      return data || [];
    },
    enabled: !!organisation?.id,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["org-users", organisation?.id],
    queryFn: async () => {
      if (!organisation?.id) return [];
      const { data } = await supabase
        .from("users")
        .select("id, name, email")
        .eq("organisation_id", organisation.id)
        .eq("status", "active")
        .order("name");
      return data || [];
    },
    enabled: !!organisation?.id,
  });

  const { data: assets = [] } = useQuery({
    queryKey: ["itam-assets-assigned", organisation?.id, userId],
    queryFn: async () => {
      if (!organisation?.id || !userId) return [];
      const { data } = await supabase
        .from("itam_assets")
        .select("*")
        .eq("organisation_id", organisation.id)
        .eq("assigned_to", userId)
        .eq("is_deleted", false);
      return data || [];
    },
    enabled: !!organisation?.id && !!userId,
  });

  const allocateLicense = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profileData } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", user.id)
        .maybeSingle();

      const tenantId = profileData?.tenant_id || 1;

      // Check current allocation
      const selectedLicense = licenses.find(l => l.id === parseInt(licenseId));
      if (!selectedLicense) throw new Error("License not found");

      if (selectedLicense.seats_allocated >= selectedLicense.seats_total) {
        throw new Error("No seats available for this license");
      }

      // Create allocation
      const { error: allocError } = await supabase.from("itam_license_allocations").insert({
        tenant_id: tenantId,
        license_id: parseInt(licenseId),
        asset_id: assetId ? parseInt(assetId) : null,
        user_id: userId,
        created_by: user.id,
      });

      if (allocError) throw allocError;

      // Update seats allocated
      const { error: updateError } = await supabase
        .from("itam_licenses")
        .update({ seats_allocated: selectedLicense.seats_allocated + 1 })
        .eq("id", parseInt(licenseId));

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itam-licenses"] });
      queryClient.invalidateQueries({ queryKey: ["itam-license-allocations"] });
      toast.success("License allocated successfully");
      navigate("/helpdesk/assets/licenses");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to allocate license");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!licenseId || !userId) {
      toast.error("Please select a license and user");
      return;
    }

    allocateLicense.mutate();
  };

  const selectedLicense = licenses.find(l => l.id === parseInt(licenseId));
  const availableSeats = selectedLicense
    ? selectedLicense.seats_total - selectedLicense.seats_allocated
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-2xl font-bold">Allocate License</h1>
            <p className="text-sm text-muted-foreground">
              Assign a license seat to a user
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Allocation Details</CardTitle>
              <CardDescription>Select license, user, and optionally an asset</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="license">License *</Label>
                <Select value={licenseId} onValueChange={setLicenseId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select license" />
                  </SelectTrigger>
                  <SelectContent>
                    {licenses.map((license) => (
                      <SelectItem key={license.id} value={license.id.toString()}>
                        {license.name} ({license.seats_allocated}/{license.seats_total} seats used)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedLicense && (
                  <p className="text-sm text-muted-foreground">
                    {availableSeats > 0
                      ? `${availableSeats} seats available`
                      : "No seats available"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="user">User *</Label>
                <Select value={userId} onValueChange={setUserId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {userId && assets.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="asset">Asset (Optional)</Label>
                  <Select value={assetId} onValueChange={setAssetId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select asset" />
                    </SelectTrigger>
                    <SelectContent>
                      {assets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id.toString()}>
                          {asset.name} ({asset.asset_tag})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/helpdesk/assets/licenses")}
                  disabled={allocateLicense.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={allocateLicense.isPending || availableSeats === 0}
                >
                  {allocateLicense.isPending ? "Allocating..." : "Allocate License"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default AllocateLicense;
