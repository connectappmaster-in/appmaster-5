import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganisation } from "@/contexts/OrganisationContext";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const AddLicense = () => {
  const navigate = useNavigate();
  const { organisation } = useOrganisation();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    vendor_id: "",
    purchase_date: "",
    seats_total: "",
    expiry_date: "",
    license_key: "",
    notes: "",
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ["itam-vendors", organisation?.id],
    queryFn: async () => {
      if (!organisation?.id) return [];
      const { data } = await supabase
        .from("itam_vendors")
        .select("*")
        .eq("organisation_id", organisation.id)
        .eq("is_deleted", false)
        .order("name");
      return data || [];
    },
    enabled: !!organisation?.id,
  });

  const createLicense = useMutation({
    mutationFn: async (data: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: userData } = await supabase
        .from("users")
        .select("organisation_id")
        .eq("auth_user_id", user.id)
        .single();

      const { data: profileData } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", user.id)
        .maybeSingle();

      const tenantId = profileData?.tenant_id || 1;

      const { error } = await supabase.from("itam_licenses").insert({
        ...data,
        tenant_id: tenantId,
        organisation_id: userData?.organisation_id,
        seats_allocated: 0,
        created_by: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itam-licenses"] });
      toast.success("License added successfully");
      navigate("/helpdesk/assets/licenses");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add license");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.seats_total) {
      toast.error("Please fill in required fields");
      return;
    }

    createLicense.mutate({
      name: formData.name,
      vendor_id: formData.vendor_id ? parseInt(formData.vendor_id) : null,
      purchase_date: formData.purchase_date || null,
      seats_total: parseInt(formData.seats_total),
      expiry_date: formData.expiry_date || null,
      license_key: formData.license_key || null,
      notes: formData.notes || null,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-2xl font-bold">Add Software License</h1>
            <p className="text-sm text-muted-foreground">
              Register a new software license
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>License Details</CardTitle>
              <CardDescription>
                Enter the license information and seat allocation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">License Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Microsoft Office 365"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vendor_id">Vendor</Label>
                  <Select
                    value={formData.vendor_id}
                    onValueChange={(value) => setFormData({ ...formData, vendor_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id.toString()}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seats_total">Total Seats *</Label>
                  <Input
                    id="seats_total"
                    type="number"
                    min="1"
                    placeholder="10"
                    value={formData.seats_total}
                    onChange={(e) => setFormData({ ...formData, seats_total: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchase_date">Purchase Date</Label>
                  <Input
                    id="purchase_date"
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiry_date">Expiry Date</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="license_key">License Key</Label>
                <Input
                  id="license_key"
                  placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
                  value={formData.license_key}
                  onChange={(e) => setFormData({ ...formData, license_key: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional information..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/helpdesk/assets/licenses")}
                  disabled={createLicense.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createLicense.isPending}>
                  {createLicense.isPending ? "Adding..." : "Add License"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default AddLicense;
