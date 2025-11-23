import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganisation } from "@/contexts/OrganisationContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Wrench, Calendar, TrendingUp, AlertCircle, CheckCircle, Activity, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: any;
  trend?: {
    value: string;
    positive: boolean;
  };
  description?: string;
  onClick?: () => void;
}

const StatCard = ({ title, value, icon: Icon, trend, description, onClick }: StatCardProps) => {
  return (
    <Card 
      className={`p-6 hover:shadow-lg transition-all ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold mb-2">{value}</p>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {trend && (
            <div className={`text-sm font-medium mt-1 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </div>
          )}
        </div>
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>
    </Card>
  );
};

export function OrgDashboard() {
  const { organisation } = useOrganisation();
  const navigate = useNavigate();

  const { data: users } = useQuery({
    queryKey: ["org-users-count", organisation?.id],
    queryFn: async () => {
      if (!organisation?.id) return [];

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("organisation_id", organisation.id)
        .eq("user_type", "organization");

      if (error) throw error;
      return data;
    },
    enabled: !!organisation?.id,
  });

  const { data: subscription } = useQuery({
    queryKey: ["org-subscription-dash", organisation?.id],
    queryFn: async () => {
      if (!organisation?.id) return null;

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("organisation_id", organisation.id)
        .eq("status", "active")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!organisation?.id,
  });

  const { data: recentLogs } = useQuery({
    queryKey: ["org-audit-logs", organisation?.id],
    queryFn: async () => {
      if (!organisation?.id) return [];

      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("organisation_id", organisation.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!organisation?.id,
  });

  const activeUsers = users?.filter(u => u.status === "active").length || 0;
  const inactiveUsers = users?.filter(u => u.status !== "active").length || 0;
  const activeTools = organisation?.active_tools?.length || 0;

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'user_signup':
      case 'user_created':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'user_deleted':
      case 'organisation_deleted':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Users" 
          value={users?.length || 0} 
          icon={Users}
          trend={{ value: `${activeUsers} active`, positive: true }}
          description="Organization members"
          onClick={() => navigate("/org-admin/users")}
        />
        
        <StatCard 
          title="Active Tools" 
          value={activeTools} 
          icon={Wrench}
          description="Enabled for organization"
          onClick={() => navigate("/org-admin/tools")}
        />
        
        <StatCard 
          title="Subscription" 
          value={subscription?.plan_name || organisation?.plan || "Free"} 
          icon={TrendingUp}
          description="Current plan"
          onClick={() => navigate("/org-admin/billing")}
        />
        
        <StatCard 
          title="Renewal" 
          value={
            subscription?.renewal_date 
              ? new Date(subscription.renewal_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
              : "N/A"
          } 
          icon={Calendar}
          description="Next billing date"
          onClick={() => navigate("/org-admin/billing")}
        />
      </div>

      {/* Organization Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Organization Details</CardTitle>
          <CardDescription className="text-xs">Basic information and quick actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1">Name</div>
              <div className="text-sm font-semibold">{organisation?.name}</div>
            </div>
            {(organisation as any)?.address && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Address</div>
                <div className="text-xs">{(organisation as any).address}</div>
              </div>
            )}
            {(organisation as any)?.billing_email && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Billing Email</div>
                <div className="text-xs">{(organisation as any).billing_email}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Tools List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Enabled Tools</CardTitle>
          <CardDescription className="text-xs">
            Tools currently active for your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeTools > 0 ? (
            <div className="flex flex-wrap gap-2">
              {organisation?.active_tools?.map((tool) => (
                <Badge key={tool} variant="secondary" className="text-xs px-2 py-1">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {tool.charAt(0).toUpperCase() + tool.slice(1)}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No tools enabled yet</p>
              <a href="/org-admin/tools" className="text-primary hover:underline text-xs mt-2 inline-block">
                Enable tools
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <CardDescription className="text-xs">Latest actions in your organization</CardDescription>
        </CardHeader>
        <CardContent>
          {recentLogs && recentLogs.length > 0 ? (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  {getActionIcon(log.action_type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{log.action_type.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Activity className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
