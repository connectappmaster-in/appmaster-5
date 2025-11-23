import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Package, TrendingDown, DollarSign, AlertCircle } from "lucide-react";
import { AssetsList } from "@/components/ITAM/AssetsList";
import { CreateAssetDialog } from "@/components/ITAM/CreateAssetDialog";

export default function ITAM() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["itam-stats"],
    queryFn: async () => {
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
      const orgId = userData?.organisation_id;

      let query = supabase.from("assets").select("*", { count: "exact" });
      
      if (orgId) {
        query = query.eq("organisation_id", orgId);
      } else {
        query = query.eq("tenant_id", tenantId);
      }

      const { data: assets, count } = await query;

      const totalValue = assets?.reduce((sum, asset) => sum + (asset.current_value || 0), 0) || 0;
      const activeAssets = assets?.filter(a => a.status === "active").length || 0;
      const depreciating = assets?.filter(a => a.depreciation_method && a.current_value && a.current_value < a.purchase_price).length || 0;

      return {
        totalAssets: count || 0,
        activeAssets,
        totalValue,
        depreciating,
      };
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <BackButton />
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">IT Asset Management</h1>
            <p className="text-muted-foreground">
              Track and manage your organization's IT assets
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Asset
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "-" : stats?.totalAssets}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Assets</CardTitle>
              <AlertCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "-" : stats?.activeAssets}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "-" : `₹${(stats?.totalValue || 0).toLocaleString()}`}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Depreciating</CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "-" : stats?.depreciating}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Assets</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="retired">Retired</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <AssetsList status={undefined} />
          </TabsContent>

          <TabsContent value="active">
            <AssetsList status="active" />
          </TabsContent>

          <TabsContent value="maintenance">
            <AssetsList status="maintenance" />
          </TabsContent>

          <TabsContent value="retired">
            <AssetsList status="retired" />
          </TabsContent>
        </Tabs>
      </div>

      <CreateAssetDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
}
