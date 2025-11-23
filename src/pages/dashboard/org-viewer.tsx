import { useAuth } from "@/contexts/AuthContext";
import { useOrganisation } from "@/contexts/OrganisationContext";
import { Navigate } from "react-router-dom";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, Ticket, Package, TrendingUp, 
  Eye, BarChart3
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

const OrgViewerDashboard = () => {
  const { user, accountType, userRole, loading } = useAuth();
  const { organisation } = useOrganisation();

  const { data: stats } = useQuery({
    queryKey: ["org-viewer-stats", organisation?.id],
    queryFn: async () => {
      if (!organisation?.id) return { leads: 0, tickets: 0, users: 0 };
      
      const [leadsCount, ticketsCount, usersCount] = await Promise.all([
        supabase.from("crm_leads").select("*", { count: "exact", head: true }).eq("organisation_id", organisation.id),
        supabase.from("tickets").select("*", { count: "exact", head: true }).eq("organisation_id", organisation.id),
        supabase.from("users").select("*", { count: "exact", head: true }).eq("organisation_id", organisation.id).eq("status", "active"),
      ]);

      return {
        leads: leadsCount.count || 0,
        tickets: ticketsCount.count || 0,
        users: usersCount.count || 0,
      };
    },
    enabled: !!user && !!organisation?.id,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const role = userRole?.toLowerCase();
  if (accountType !== "organization" || (role !== "viewer" && role !== "read-only")) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <div className="container mx-auto px-4 py-4 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">{organisation?.name}</h1>
          <p className="text-sm text-muted-foreground">Viewer Dashboard - Read-Only Access</p>
        </div>

        <Alert>
          <Eye className="h-4 w-4" />
          <AlertDescription>
            You have read-only access. Contact your administrator for edit permissions.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard
            title="Active Users"
            value={stats?.users || 0}
            icon={Users}
            color="from-blue-500 to-blue-600"
          />
          <StatsCard
            title="Total Leads"
            value={stats?.leads || 0}
            icon={TrendingUp}
            color="from-green-500 to-green-600"
          />
          <StatsCard
            title="Support Tickets"
            value={stats?.tickets || 0}
            icon={Ticket}
            color="from-orange-500 to-orange-600"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Reports Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View organization reports and analytics in read-only mode.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Data Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You can view all organizational data but cannot make changes.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrgViewerDashboard;
