import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Package, Calendar, DollarSign, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { EditAssetDialog } from "./EditAssetDialog";
import { AssignAssetDialog } from "./AssignAssetDialog";

interface AssetsListProps {
  status?: string;
}

const statusColors: Record<string, string> = {
  active: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  maintenance: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  retired: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
  disposed: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
};

export const AssetsList = ({ status }: AssetsListProps) => {
  const [editAsset, setEditAsset] = useState<any>(null);
  const [assignAsset, setAssignAsset] = useState<any>(null);

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ["assets", status],
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

      let query = supabase.from("assets").select("*").order("created_at", { ascending: false });

      if (orgId) {
        query = query.eq("organisation_id", orgId);
      } else {
        query = query.eq("tenant_id", tenantId);
      }

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No assets found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((asset) => (
          <Card key={asset.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{asset.name}</CardTitle>
                  {asset.asset_type && (
                    <Badge variant="outline" className="mb-2">
                      {asset.asset_type}
                    </Badge>
                  )}
                </div>
                <Badge className={statusColors[asset.status || "active"]}>
                  {asset.status?.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Purchased:</span>
                <span>{format(new Date(asset.purchase_date), "MMM d, yyyy")}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Purchase Price:</span>
                <span className="font-medium">₹{asset.purchase_price.toLocaleString()}</span>
              </div>

              {asset.current_value !== null && (
                <div className="flex items-center gap-2 text-sm">
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Current Value:</span>
                  <span className="font-medium">₹{asset.current_value.toLocaleString()}</span>
                </div>
              )}

              {asset.depreciation_method && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Depreciation:</span>
                  <span className="ml-2 capitalize">{asset.depreciation_method}</span>
                  {asset.useful_life_years && (
                    <span className="text-muted-foreground ml-1">
                      ({asset.useful_life_years} years)
                    </span>
                  )}
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditAsset(asset)}
                >
                  Edit
                </Button>
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={() => setAssignAsset(asset)}
                >
                  Assign
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editAsset && (
        <EditAssetDialog
          asset={editAsset}
          open={!!editAsset}
          onOpenChange={(open) => !open && setEditAsset(null)}
        />
      )}
      
      {assignAsset && (
        <AssignAssetDialog
          asset={assignAsset}
          open={!!assignAsset}
          onOpenChange={(open) => !open && setAssignAsset(null)}
        />
      )}
    </>
  );
};
