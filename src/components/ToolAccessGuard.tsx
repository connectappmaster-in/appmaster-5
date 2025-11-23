import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, ShieldAlert, AlertTriangle, Megaphone } from "lucide-react";
import { Button } from "./ui/button";

interface ToolAccessGuardProps {
  toolKey: string;
  children: React.ReactNode;
}

export const ToolAccessGuard = ({ toolKey, children }: ToolAccessGuardProps) => {
  const { user, accountType } = useAuth();
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToolInactive, setIsToolInactive] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [inactiveToolNotice, setInactiveToolNotice] = useState<{ title: string; description: string } | null>(null);

  useEffect(() => {
    checkAccess();
    fetchInactiveToolNotice();
  }, [user, toolKey, accountType]);

  const fetchInactiveToolNotice = async () => {
    // First, try to fetch tool-specific inactive notice
    const { data: toolData } = await supabase
      .from('tools')
      .select('id')
      .eq('key', toolKey)
      .maybeSingle();

    if (toolData) {
      const { data: toolSpecificNotice } = await supabase
        .from('tool_inactive_notices')
        .select('title, message')
        .eq('tool_id', toolData.id)
        .eq('is_active', true)
        .maybeSingle();

      if (toolSpecificNotice) {
        setInactiveToolNotice({
          title: toolSpecificNotice.title,
          description: toolSpecificNotice.message
        });
        return;
      }
    }

    // Fallback to generic broadcast message
    const { data: broadcastNotice } = await supabase
      .from('broadcasts')
      .select('title, description')
      .eq('is_active', true)
      .ilike('title', '%tool inactive%')
      .or(`scheduled_for.is.null,scheduled_for.lte.${new Date().toISOString()}`)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .maybeSingle();

    if (broadcastNotice) {
      setInactiveToolNotice(broadcastNotice);
    }
  };

  const checkAccess = async () => {
    if (!user) {
      setHasAccess(false);
      setIsLoading(false);
      return;
    }

    try {
      // Check if user is Super Admin
      const { data: superAdminData } = await supabase
        .from('appmaster_admins')
        .select('is_active')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      const isSuperAdminUser = !!superAdminData;
      setIsSuperAdmin(isSuperAdminUser);

      // Check if tool is active
      const { data: toolData, error: toolError } = await supabase
        .from('tools')
        .select('active')
        .eq('key', toolKey)
        .maybeSingle();

      if (toolError) {
        console.error("Error checking tool status:", toolError);
      }

      // Super Admin can access any tool regardless of status
      if (isSuperAdminUser) {
        setHasAccess(true);
        setIsToolInactive(!toolData?.active);
        setIsLoading(false);
        return;
      }

      // Check if tool is active - block access if inactive
      if (!toolData?.active) {
        setHasAccess(false);
        setIsToolInactive(true);
        setIsLoading(false);
        return;
      }

      // Individual users have full access to active tools
      if (accountType === 'personal') {
        setHasAccess(true);
        setIsLoading(false);
        return;
      }

      // Check if user has the tool assigned
      const { data, error } = await supabase.rpc('user_has_tool_access', {
        user_auth_id: user.id,
        tool_key: toolKey,
      });

      if (error) {
        console.error("Error checking tool access:", error);
        setHasAccess(false);
      } else {
        setHasAccess(data);
      }
    } catch (error) {
      console.error("Error in checkAccess:", error);
      setHasAccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full bg-card border rounded-lg p-8 text-center space-y-4">
          <div className={`mx-auto w-16 h-16 ${isToolInactive ? 'bg-warning/10' : 'bg-destructive/10'} rounded-full flex items-center justify-center`}>
            {isToolInactive ? (
              <AlertTriangle className="w-8 h-8 text-warning" />
            ) : (
              <ShieldAlert className="w-8 h-8 text-destructive" />
            )}
          </div>
          <h2 className="text-2xl font-bold">
            {isToolInactive ? 'Tool Unavailable' : 'Access Denied'}
          </h2>
          <p className="text-muted-foreground">
            {isToolInactive 
              ? 'This tool is currently unavailable. Contact your admin for more information.'
              : "You don't have access to this tool. Contact your Organization Admin to request access."}
          </p>
          <div className="flex gap-2 justify-center pt-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Go Back
            </Button>
            <Button onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {isSuperAdmin && isToolInactive && inactiveToolNotice && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-blue-50 dark:bg-blue-950/30 border-b border-blue-200 dark:border-blue-800">
          <div className="container mx-auto px-4 py-2">
            <div className="bg-blue-100 dark:bg-blue-900/50 border-l-4 border-blue-500 px-4 py-3 flex items-start gap-3 rounded-md">
              <Megaphone className="h-5 w-5 text-blue-700 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  {inactiveToolNotice.title}
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {inactiveToolNotice.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      <div style={{ paddingTop: isSuperAdmin && isToolInactive && inactiveToolNotice ? '80px' : '0' }}>
        {children}
      </div>
    </>
  );
};
