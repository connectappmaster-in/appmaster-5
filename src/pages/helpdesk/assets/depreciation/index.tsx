import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganisation } from "@/contexts/OrganisationContext";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, FileText, Play, Clock, DollarSign, Package } from "lucide-react";
import { format } from "date-fns";
const DepreciationDashboard = () => {
  const navigate = useNavigate();
  const {
    organisation
  } = useOrganisation();
  const {
    data: profiles = []
  } = useQuery({
    queryKey: ["depreciation-profiles", organisation?.id],
    queryFn: async () => {
      if (!organisation?.id) return [];
      const {
        data
      } = await supabase.from("asset_depreciation_profiles").select("*").eq("is_active", true).eq("is_deleted", false);
      return data || [];
    },
    enabled: !!organisation?.id
  });
  const {
    data: runLogs = []
  } = useQuery({
    queryKey: ["depreciation-run-logs", organisation?.id],
    queryFn: async () => {
      const {
        data
      } = await supabase.from("depreciation_run_logs").select("*").order("run_date", {
        ascending: false
      }).limit(5);
      return data || [];
    }
  });
  const {
    data: entries = []
  } = useQuery({
    queryKey: ["depreciation-entries-recent", organisation?.id],
    queryFn: async () => {
      const {
        data
      } = await supabase.from("depreciation_entries").select("*").eq("posted", true).order("created_at", {
        ascending: false
      }).limit(10);
      return data || [];
    }
  });
  const totalDepreciation = entries.reduce((sum, e) => sum + (parseFloat(String(e.depreciation_amount)) || 0), 0);
  const activeProfiles = profiles.length;
  const lastRun = runLogs[0];
  return <div className="min-h-screen bg-background">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-3xl font-bold">Depreciation Management</h1>
              
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/helpdesk/assets/depreciation/profile-create")}>
              Create Profile
            </Button>
            <Button variant="outline" onClick={() => navigate("/helpdesk/assets/depreciation/run")}>
              <Play className="h-4 w-4 mr-2" />
              Run Depreciation
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Profiles</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeProfiles}</div>
              <p className="text-xs text-muted-foreground">Assets being depreciated</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Period</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">INR {totalDepreciation.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total depreciation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Run</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {lastRun ? format(new Date(lastRun.run_date), "MMM dd") : "—"}
              </div>
              <p className="text-xs text-muted-foreground">
                {lastRun ? `${lastRun.entries_created} entries` : "No runs yet"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entries</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{entries.length}</div>
              <p className="text-xs text-muted-foreground">Recent posted entries</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Profiles */}
        <Card>
          <CardHeader>
            <CardTitle>Active Depreciation Profiles</CardTitle>
            <CardDescription>Assets currently being depreciated</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {profiles.slice(0, 10).map(profile => <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer" onClick={() => navigate(`/helpdesk/assets/depreciation/profile-detail/${profile.id}`)}>
                  <div>
                    <p className="font-medium">Asset ID: {profile.asset_id}</p>
                    <p className="text-sm text-muted-foreground">
                      {profile.frequency}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">INR {profile.cost_basis.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{profile.useful_life_years} years</p>
                  </div>
                </div>)}
              {profiles.length === 0 && <p className="text-center text-muted-foreground py-8">
                  No active depreciation profiles. Create one to start tracking depreciation.
                </p>}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/helpdesk/assets/depreciation/profile-create")}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <TrendingDown className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Create Profile</p>
                <p className="text-sm text-muted-foreground">Setup depreciation for an asset</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/helpdesk/assets/depreciation/run")}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Play className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Run Depreciation</p>
                <p className="text-sm text-muted-foreground">Manual depreciation run</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/helpdesk/assets/depreciation/reports")}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">View Reports</p>
                <p className="text-sm text-muted-foreground">Depreciation analytics</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
};
export default DepreciationDashboard;