import { AssetTopBar } from "@/components/ITAM/AssetTopBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Plus, List, Clock, TrendingDown, DollarSign, AlertCircle, Wrench, CheckCircle } from "lucide-react";
import { lazy, Suspense, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CreateAssetDialog } from "@/components/ITAM/CreateAssetDialog";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load charts for performance
const PieChart = lazy(() => import("recharts").then(mod => ({
  default: mod.PieChart
})));
const Pie = lazy(() => import("recharts").then(mod => ({
  default: mod.Pie
})));
const BarChart = lazy(() => import("recharts").then(mod => ({
  default: mod.BarChart
})));
const Bar = lazy(() => import("recharts").then(mod => ({
  default: mod.Bar
})));
const Cell = lazy(() => import("recharts").then(mod => ({
  default: mod.Cell
})));
const ResponsiveContainer = lazy(() => import("recharts").then(mod => ({
  default: mod.ResponsiveContainer
})));
const Tooltip = lazy(() => import("recharts").then(mod => ({
  default: mod.Tooltip
})));
export default function HelpdeskAssets() {
  const navigate = useNavigate();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Optimized parallel data fetching
  const {
    data: assetData,
    isLoading
  } = useQuery({
    queryKey: ["assets-overview"],
    queryFn: async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return null;

      // Parallel fetch user context
      const [userData, profileData] = await Promise.all([supabase.from("users").select("organisation_id").eq("auth_user_id", user.id).single(), supabase.from("profiles").select("tenant_id").eq("id", user.id).maybeSingle()]);
      const tenantId = profileData.data?.tenant_id || 1;
      const orgId = userData.data?.organisation_id;

      // Build base queries
      let assetsQuery = supabase.from("itam_assets").select("*").eq("is_deleted", false);
      let eventsQuery = supabase.from("asset_events").select("*, itam_assets(asset_tag, name)").order("created_at", {
        ascending: false
      }).limit(5);
      if (orgId) {
        assetsQuery = assetsQuery.eq("organisation_id", orgId);
        eventsQuery = eventsQuery.eq("tenant_id", tenantId);
      } else {
        assetsQuery = assetsQuery.eq("tenant_id", tenantId);
        eventsQuery = eventsQuery.eq("tenant_id", tenantId);
      }

      // Parallel fetch all data
      const [assetsResult, eventsResult] = await Promise.all([assetsQuery, eventsQuery]);
      return {
        assets: assetsResult.data || [],
        recentEvents: eventsResult.data || []
      };
    },
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });
  const allAssets = assetData?.assets || [];
  const recentEvents = assetData?.recentEvents || [];

  // Calculate metrics
  const metrics = useMemo(() => {
    const activeAssets = allAssets.filter(a => a.status !== 'retired' && a.status !== 'disposed');
    const availableAssets = allAssets.filter(a => a.status === 'available');
    const maintenanceAssets = allAssets.filter(a => a.status === 'in_repair');
    const retiredAssets = allAssets.filter(a => a.status === 'retired');

    // Recently added (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentlyAdded = allAssets.filter(a => new Date(a.created_at) > thirtyDaysAgo);

    // Warranty expiring soon (next 60 days)
    const sixtyDaysLater = new Date();
    sixtyDaysLater.setDate(sixtyDaysLater.getDate() + 60);
    const warrantyExpiring = allAssets.filter(a => a.warranty_end && new Date(a.warranty_end) <= sixtyDaysLater && new Date(a.warranty_end) > new Date());
    const totalValue = allAssets.reduce((sum, a) => sum + (a.cost || 0), 0);
    const totalDepreciation = allAssets.reduce((sum, a) => sum + (a.accumulated_depreciation || 0), 0);
    const netBookValue = totalValue - totalDepreciation;
    return {
      activeAssets: activeAssets.length,
      availableAssets: availableAssets.length,
      recentlyAdded: recentlyAdded.length,
      maintenanceAssets: maintenanceAssets.length,
      warrantyExpiring: warrantyExpiring.length,
      retiredAssets: retiredAssets.length,
      totalValue,
      netBookValue,
      totalDepreciation
    };
  }, [allAssets]);

  // Chart data
  const statusData = useMemo(() => [{
    name: 'Available',
    value: allAssets.filter(a => a.status === 'available').length,
    color: 'hsl(var(--chart-2))'
  }, {
    name: 'Checked Out',
    value: allAssets.filter(a => a.status === 'checked_out').length,
    color: 'hsl(var(--chart-1))'
  }, {
    name: 'Maintenance',
    value: allAssets.filter(a => a.status === 'in_repair').length,
    color: 'hsl(var(--chart-3))'
  }, {
    name: 'Retired',
    value: allAssets.filter(a => a.status === 'retired').length,
    color: 'hsl(var(--chart-4))'
  }].filter(d => d.value > 0), [allAssets]);
  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    allAssets.forEach(asset => {
      const category = asset.category || 'Other';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });
    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value
    })).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [allAssets]);
  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(221.2 83.2% 53.3%)'];
  if (isLoading) {
    return <div className="min-h-screen bg-background">
        <AssetTopBar />
        <div className="px-4 space-y-4 mt-2">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-9 w-24" />)}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      <AssetTopBar />
      
      <div className="px-3 space-y-3 mt-2">
        {/* Quick Actions Row */}
        <div className="flex gap-2 flex-wrap">
          
          
          <Button size="sm" onClick={() => setCreateDialogOpen(true)} className="gap-1.5 h-8 ml-auto">
            <Plus className="h-3.5 w-3.5" />
            <span className="text-sm">Add Asset</span>
          </Button>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {/* Active Assets */}
          <Card className="hover:shadow-sm transition-shadow cursor-pointer hover:border-primary/20" onClick={() => navigate("/helpdesk/assets/allassets?status=active")}>
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-0.5">Active Assets</p>
                  <p className="text-2xl font-bold">{metrics.activeAssets}</p>
                </div>
                <div className="w-8 h-8 rounded-md bg-blue-500/10 flex items-center justify-center">
                  <Package className="w-4 h-4 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Assets */}
          <Card className="hover:shadow-sm transition-shadow cursor-pointer hover:border-primary/20" onClick={() => navigate("/helpdesk/assets/allassets?status=available")}>
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-0.5">Available</p>
                  <p className="text-2xl font-bold">{metrics.availableAssets}</p>
                </div>
                <div className="w-8 h-8 rounded-md bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recently Added */}
          <Card className="hover:shadow-sm transition-shadow cursor-pointer hover:border-primary/20" onClick={() => navigate("/helpdesk/assets/allassets?recent=30")}>
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-0.5">Recently Added</p>
                  <p className="text-2xl font-bold">{metrics.recentlyAdded}</p>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </div>
                <div className="w-8 h-8 rounded-md bg-blue-500/10 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* In Maintenance */}
          <Card className="hover:shadow-sm transition-shadow cursor-pointer hover:border-primary/20" onClick={() => navigate("/helpdesk/assets/allassets?status=in_repair")}>
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-0.5">In Maintenance</p>
                  <p className="text-2xl font-bold">{metrics.maintenanceAssets}</p>
                </div>
                <div className="w-8 h-8 rounded-md bg-orange-500/10 flex items-center justify-center">
                  <Wrench className="w-4 h-4 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warranty Expiring */}
          <Card className="hover:shadow-sm transition-shadow cursor-pointer hover:border-primary/20" onClick={() => navigate("/helpdesk/assets/allassets?warranty=expiring")}>
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-0.5">Warranty Expiring</p>
                  <p className="text-2xl font-bold">{metrics.warrantyExpiring}</p>
                  <p className="text-xs text-muted-foreground">Next 60 days</p>
                </div>
                <div className="w-8 h-8 rounded-md bg-yellow-500/10 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Retired Assets */}
          <Card className="hover:shadow-sm transition-shadow cursor-pointer hover:border-primary/20" onClick={() => navigate("/helpdesk/assets/allassets?status=retired")}>
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-0.5">Retired Assets</p>
                  <p className="text-2xl font-bold">{metrics.retiredAssets}</p>
                </div>
                <div className="w-8 h-8 rounded-md bg-gray-500/10 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Asset Value */}
          <Card className="hover:shadow-sm transition-shadow cursor-pointer hover:border-primary/20" onClick={() => navigate("/helpdesk/assets/depreciation/reports")}>
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-0.5">Total Value</p>
                  <p className="text-xl font-bold">₹{(metrics.totalValue / 100000).toFixed(1)}L</p>
                </div>
                <div className="w-8 h-8 rounded-md bg-purple-500/10 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Net Book Value */}
          <Card className="hover:shadow-sm transition-shadow cursor-pointer hover:border-primary/20" onClick={() => navigate("/helpdesk/assets/depreciation/reports")}>
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-0.5">Net Book Value</p>
                  <p className="text-xl font-bold">₹{(metrics.netBookValue / 100000).toFixed(1)}L</p>
                </div>
                <div className="w-8 h-8 rounded-md bg-green-500/10 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Depreciation Summary and Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-2">
          {/* Depreciation Summary */}
          <Card className="cursor-pointer hover:shadow-sm transition-shadow hover:border-primary/20" onClick={() => navigate("/helpdesk/assets/depreciation/reports")}>
            <CardContent className="p-3">
              <h3 className="text-sm font-semibold mb-2">Depreciation Summary</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Total Value</p>
                  <p className="text-lg font-bold">₹{(metrics.totalValue / 100000).toFixed(2)}L</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Depreciation</p>
                  <p className="text-lg font-bold text-orange-500">₹{(metrics.totalDepreciation / 100000).toFixed(2)}L</p>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">Net Book Value</p>
                  <p className="text-xl font-bold text-green-500">₹{(metrics.netBookValue / 100000).toFixed(2)}L</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">Recent Activity</h3>
                <Button size="sm" variant="ghost" onClick={() => navigate("/helpdesk/assets/audit")}>
                  View All
                </Button>
              </div>
              <div className="space-y-1">
                {recentEvents.slice(0, 5).map((event: any) => <div key={event.id} className="flex items-center justify-between py-1.5 border-b last:border-0 cursor-pointer hover:bg-accent/50 rounded px-2 -mx-2" onClick={() => navigate(`/helpdesk/assets/detail/${event.asset_id}`)}>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{event.itam_assets?.asset_tag || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground">{event.event_type} • {event.itam_assets?.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.created_at).toLocaleDateString()}
                    </p>
                  </div>)}
                {recentEvents.length === 0 && <p className="text-sm text-muted-foreground text-center py-3">No recent activity</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <CreateAssetDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>;
}