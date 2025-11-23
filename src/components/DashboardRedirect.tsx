import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export const DashboardRedirect = () => {
  const { user, accountType, userRole, userType, appmasterRole, loading } = useAuth();

  // Check if the user is an active AppMaster admin
  const { data: isAppmasterAdmin, isLoading: checkingAdmin } = useQuery({
    queryKey: ["is-appmaster-admin", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data } = await supabase
        .from("appmaster_admins")
        .select("admin_role")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      return data?.admin_role || null;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Memoize the redirect path to prevent infinite loops
  const redirectPath = useMemo(() => {
    if (loading || checkingAdmin) return null;
    if (!user) return "/login";

    // AppMaster Admin gets priority
    if (userType === "appmaster_admin" || isAppmasterAdmin || appmasterRole) {
      return "/super-admin";
    }

    // Individual account users
    if (userType === "individual" || accountType === "personal") {
      return "/dashboard/individual";
    }

    // Organization account users - wait for role to be loaded
    if (userType === "organization" || accountType === "organization") {
      // If role hasn't loaded yet, wait
      if (userRole === null) return null;
      
      const role = userRole?.toLowerCase();

      if (role === "admin" || role === "owner") {
        return "/org-admin";
      }

      if (role === "manager" || role === "editor" || role === "employee") {
        return "/dashboard/org-editor";
      }

      if (role === "viewer" || role === "read-only") {
        return "/dashboard/org-viewer";
      }

      // Default to admin for organization users without specific role
      return "/org-admin";
    }

    // Fallback to individual dashboard
    return "/dashboard/individual";
  }, [loading, checkingAdmin, user, userType, isAppmasterAdmin, appmasterRole, accountType, userRole]);

  if (loading || checkingAdmin || !redirectPath) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return <Navigate to={redirectPath} replace />;
};