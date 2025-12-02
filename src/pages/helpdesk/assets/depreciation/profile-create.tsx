import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganisation } from "@/contexts/OrganisationContext";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ProfileCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { organisation } = useOrganisation();
  const queryClient = useQueryClient();

  const [assetId, setAssetId] = useState(searchParams.get("assetId") || "");
  const [methodId, setMethodId] = useState("");
  const [costBasis, setCostBasis] = useState("");
  const [salvageValue, setSalvageValue] = useState("0");
  const [usefulLifeYears, setUsefulLifeYears] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [startDate, setStartDate] = useState("");
  const [prorateFirst, setProrateFirst] = useState(true);
  const [prorateLast, setProrateLast] = useState(true);
  const [switchToSL, setSwitchToSL] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);

  const { data: assets = [] } = useQuery({
    queryKey: ["itam-assets-for-depreciation", organisation?.id],
    queryFn: async () => {
      if (!organisation?.id) return [];
      const { data } = await supabase
        .from("itam_assets")
        .select("*")
        .eq("organisation_id", organisation.id)
        .eq("is_deleted", false)
        .is("current_depreciation_profile_id", null)
        .order("name");
      return data || [];
    },
    enabled: !!organisation?.id,
  });

  const { data: methods = [] } = useQuery({
    queryKey: ["depreciation-methods"],
    queryFn: async () => {
      const { data } = await supabase
        .from("depreciation_methods")
        .select("*")
        .order("name");
      return data || [];
    },
  });

  const selectedAsset = assets.find(a => a.id === parseInt(assetId));

  const calculatePreview = () => {
    if (!costBasis || !salvageValue || !usefulLifeYears || !methodId) {
      toast.error("Please fill all required fields");
      return;
    }

    const cost = parseFloat(costBasis);
    const salvage = parseFloat(salvageValue);
    const years = parseInt(usefulLifeYears);
    const depreciableAmount = cost - salvage;
    
    const method = methods.find(m => m.id === methodId);
    const periodsPerYear = frequency === "monthly" ? 12 : frequency === "quarterly" ? 4 : 1;
    const totalPeriods = years * periodsPerYear;

    const schedule = [];
    let accumulated = 0;

    for (let i = 0; i < Math.min(12, totalPeriods); i++) {
      let periodDepreciation = 0;

      if (method?.code === "SL") {
        periodDepreciation = depreciableAmount / totalPeriods;
      } else if (method?.code === "DB" || method?.code === "DDB") {
        const params = typeof method.parameters === 'object' ? method.parameters as any : {};
        const factor = params.factor || 2.0;
        const rate = factor / years;
        const bookValue = cost - accumulated;
        periodDepreciation = (bookValue * rate) / periodsPerYear;
        periodDepreciation = Math.min(periodDepreciation, bookValue - salvage);
      } else if (method?.code === "SYD") {
        const sumOfYears = (years * (years + 1)) / 2;
        const yearNumber = Math.floor(i / periodsPerYear) + 1;
        const remainingYears = years - yearNumber + 1;
        periodDepreciation = (depreciableAmount * remainingYears / sumOfYears) / periodsPerYear;
      }

      accumulated += periodDepreciation;
      const bookValue = cost - accumulated;

      schedule.push({
        period: i + 1,
        depreciation: Math.round(periodDepreciation * 100) / 100,
        accumulated: Math.round(accumulated * 100) / 100,
        bookValue: Math.round(bookValue * 100) / 100,
      });
    }

    setPreview(schedule);
    setShowPreview(true);
  };

  const createProfile = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profileData } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", user.id)
        .maybeSingle();

      const tenantId = profileData?.tenant_id || 1;

      const periodsPerYear = frequency === "monthly" ? 12 : frequency === "quarterly" ? 4 : 1;

      const { data: newProfile, error } = await supabase
        .from("asset_depreciation_profiles")
        .insert({
          tenant_id: tenantId,
          asset_id: parseInt(assetId),
          method_id: methodId,
          cost_basis: parseFloat(costBasis),
          salvage_value: parseFloat(salvageValue),
          useful_life_years: parseInt(usefulLifeYears),
          useful_life_periods: parseInt(usefulLifeYears) * periodsPerYear,
          depreciation_start_date: startDate,
          frequency,
          prorate_first_period: prorateFirst,
          prorate_last_period: prorateLast,
          switch_to_sl_threshold: switchToSL,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Update asset with profile reference
      await supabase
        .from("itam_assets")
        .update({
          current_depreciation_profile_id: newProfile.id,
          depreciation_status: "active",
          book_value: parseFloat(costBasis),
        })
        .eq("id", parseInt(assetId));

      return newProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["depreciation-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["itam-assets"] });
      toast.success("Depreciation profile created successfully");
      navigate("/helpdesk/assets/depreciation");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create profile");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!assetId || !methodId || !costBasis || !usefulLifeYears || !startDate) {
      toast.error("Please fill all required fields");
      return;
    }

    createProfile.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-2xl font-bold">Create Depreciation Profile</h1>
            <p className="text-sm text-muted-foreground">
              Setup depreciation schedule for an asset
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Profile Configuration</CardTitle>
              <CardDescription>Define depreciation parameters and method</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="asset">Asset *</Label>
                  <Select value={assetId} onValueChange={setAssetId} required>
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
                  {selectedAsset && (
                    <p className="text-xs text-muted-foreground">
                      Purchase Price: INR {selectedAsset.purchase_price?.toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="method">Depreciation Method *</Label>
                  <Select value={methodId} onValueChange={setMethodId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {methods.map((method) => (
                        <SelectItem key={method.id} value={method.id}>
                          {method.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost_basis">Cost Basis *</Label>
                  <Input
                    id="cost_basis"
                    type="number"
                    step="0.01"
                    placeholder="100000"
                    value={costBasis}
                    onChange={(e) => setCostBasis(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salvage">Salvage Value</Label>
                  <Input
                    id="salvage"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={salvageValue}
                    onChange={(e) => setSalvageValue(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="useful_life">Useful Life (Years) *</Label>
                  <Input
                    id="useful_life"
                    type="number"
                    min="1"
                    placeholder="5"
                    value={usefulLifeYears}
                    onChange={(e) => setUsefulLifeYears(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="prorate_first">Prorate First Period</Label>
                  <Switch
                    id="prorate_first"
                    checked={prorateFirst}
                    onCheckedChange={setProrateFirst}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="prorate_last">Prorate Last Period</Label>
                  <Switch
                    id="prorate_last"
                    checked={prorateLast}
                    onCheckedChange={setProrateLast}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="switch_sl">Switch to SL when beneficial (DB only)</Label>
                  <Switch
                    id="switch_sl"
                    checked={switchToSL}
                    onCheckedChange={setSwitchToSL}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={calculatePreview}
                  disabled={!assetId || !methodId || !costBasis || !usefulLifeYears}
                >
                  Preview Schedule
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/helpdesk/assets/depreciation")}
                  disabled={createProfile.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createProfile.isPending || !showPreview}>
                  {createProfile.isPending ? "Creating..." : "Create Profile"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        {showPreview && preview.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Depreciation Schedule Preview</CardTitle>
              <CardDescription>First 12 periods of depreciation</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Depreciation</TableHead>
                    <TableHead className="text-right">Accumulated</TableHead>
                    <TableHead className="text-right">Book Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.map((entry) => (
                    <TableRow key={entry.period}>
                      <TableCell className="font-medium">Period {entry.period}</TableCell>
                      <TableCell className="text-right">INR {entry.depreciation.toLocaleString()}</TableCell>
                      <TableCell className="text-right">INR {entry.accumulated.toLocaleString()}</TableCell>
                      <TableCell className="text-right">INR {entry.bookValue.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProfileCreate;
