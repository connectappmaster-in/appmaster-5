import { useAuth } from "@/contexts/AuthContext";
import { useOrganisation } from "@/contexts/OrganisationContext";
import { Navigate } from "react-router-dom";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { ToolCard } from "@/components/Dashboard/ToolCard";
import { Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TOOL_ICONS } from "@/lib/icons";

const OrgEditorDashboard = () => {
  const { user, accountType, userRole, loading } = useAuth();
  const { organisation } = useOrganisation();

  // Fetch user's assigned tools
  const { data: userAssignedTools = [], isLoading: isLoadingTools } = useQuery({
    queryKey: ["user-assigned-tools", user?.id, organisation?.id],
    queryFn: async () => {
      if (!user?.id || !organisation?.id) return [];
      
      // Get the user's internal ID
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();
      
      if (!userData) return [];
      
      // Get user's assigned tools with tool details
      const { data: userTools, error } = await supabase
        .from("user_tools")
        .select(`
          tool_id,
          tool:tools!inner (
            id,
            key,
            name,
            description,
            active
          )
        `)
        .eq("user_id", userData.id)
        .eq("tools.active", true);  // Use table name 'tools', not alias 'tool'
      
      if (error) {
        console.error("Error fetching user tools:", error);
        return [];
      }
      
      return userTools?.map(ut => ut.tool).filter(Boolean) || [];
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
  if (accountType !== "organization" || (role !== "manager" && role !== "editor" && role !== "employee")) {
    return <Navigate to="/dashboard" replace />;
  }

  const activeTools = organisation?.active_tools || [];
  
  // Filter tools: show only tools that are BOTH active in org AND assigned to user
  const availableTools = userAssignedTools
    .filter(tool => activeTools.includes(tool.key))
    .map(tool => {
      const toolConfig = TOOL_ICONS[tool.key];
      return {
        key: tool.key,
        name: tool.name,
        icon: toolConfig?.icon || Package,
        path: toolConfig?.path || `/${tool.key}`,
        color: toolConfig?.gradient || "from-gray-500 to-gray-600",
      };
    });

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Header Section */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
            {organisation?.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {role === 'employee' ? 'Welcome back! Here are your daily tools' : 'Operational Dashboard'}
          </p>
        </div>

        {/* Tools Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {role === 'employee' ? 'Your Tools' : 'Available Tools'}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {availableTools.length > 0 
                  ? `${availableTools.length} tool${availableTools.length !== 1 ? 's' : ''} available`
                  : 'No tools assigned yet'}
              </p>
            </div>
          </div>

          {isLoadingTools ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                <p className="text-sm text-muted-foreground">Loading your tools...</p>
              </div>
            </div>
          ) : availableTools.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold mb-1">No Tools Assigned</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Contact your organization admin to get access to tools and start working.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {availableTools.map((tool) => (
                <ToolCard
                  key={tool.key}
                  name={tool.name}
                  icon={tool.icon}
                  path={tool.path}
                  color={tool.color}
                  isActive={true}
                  isLocked={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrgEditorDashboard;
