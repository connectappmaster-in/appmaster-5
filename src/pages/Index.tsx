import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganisation } from "@/contexts/OrganisationContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { StatsCard } from "@/components/Dashboard/StatsCard";
import { ToolCard } from "@/components/Dashboard/ToolCard";
import { Users, TrendingUp, Ticket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TOOL_ICONS } from "@/lib/icons";

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { organisation, loading: orgLoading } = useOrganisation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  const { data: subscription } = useQuery({
    queryKey: ["subscription", organisation?.id],
    queryFn: async () => {
      if (!organisation) return null;
      const { data } = await supabase
        .from("subscriptions")
        .select("*, subscription_plans(*)")
        .eq("organisation_id", organisation.id)
        .eq("status", "active")
        .single();
      return data;
    },
    enabled: !!organisation,
  });

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats", organisation?.id],
    queryFn: async () => {
      if (!organisation) return null;

      const [leads, tickets, users] = await Promise.all([
        supabase.from("crm_leads").select("id", { count: "exact", head: true }).eq("organisation_id", organisation.id),
        supabase.from("tickets").select("id", { count: "exact", head: true }).eq("organisation_id", organisation.id).eq("status", "open"),
        supabase.from("users").select("id", { count: "exact", head: true }).eq("organisation_id", organisation.id).eq("status", "active"),
      ]);

      return {
        leads: leads.count || 0,
        tickets: tickets.count || 0,
        users: users.count || 0,
      };
    },
    enabled: !!organisation,
  });

  const handleActivateTool = async (toolKey: string) => {
    if (!organisation) return;

    const canActivate = await supabase.rpc("can_activate_tool", {
      org_id: organisation.id,
    });

    if (!canActivate.data) {
      toast({
        title: "Upgrade Required",
        description: "You've reached your tool limit. Please upgrade your plan.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("organisations")
      .update({
        active_tools: [...(organisation.active_tools || []), toolKey],
      })
      .eq("id", organisation.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to activate tool.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Tool activated successfully!",
      });
      window.location.reload();
    }
  };

  const tools = Object.entries(TOOL_ICONS).map(([key, config]) => ({
    key,
    name: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    icon: config.icon,
    path: config.path,
    color: config.gradient,
  }));

  const maxTools = subscription?.subscription_plans?.max_tools || 1;
  const activeTools = organisation?.active_tools || [];

  if (authLoading || orgLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back! Here's an overview of your business.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatsCard title="Active Users" value={stats?.users || 0} icon={Users} color="from-blue-500 to-blue-600" />
          <StatsCard title="CRM Leads" value={stats?.leads || 0} icon={TrendingUp} color="from-emerald-500 to-emerald-600" />
          <StatsCard title="Open Support Tickets" value={stats?.tickets || 0} icon={Ticket} color="from-cyan-500 to-cyan-600" />
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-1">Your Tools</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Using {activeTools.length} of {maxTools === -1 ? "unlimited" : maxTools} tools
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tools.map((tool) => {
            const isActive = activeTools.includes(tool.key);
            const isLocked = !isActive && activeTools.length >= maxTools && maxTools !== -1;

            return (
              <ToolCard
                key={tool.key}
                name={tool.name}
                icon={tool.icon}
                path={tool.path}
                color={tool.color}
                isActive={isActive}
                isLocked={isLocked}
                onActivate={() => handleActivateTool(tool.key)}
              />
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Index;