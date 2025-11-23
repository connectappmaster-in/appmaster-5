import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const SuperAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  // Verify user is actually an appmaster admin by checking both tables
  const { data: adminCheck, isLoading } = useQuery({
    queryKey: ["super-admin-access", user?.id],
    queryFn: async () => {
      if (!user) return { isAdmin: false, userType: null };
      
      // First check users table for user_type
      const { data: userData } = await supabase
        .from("users")
        .select("user_type")
        .eq("auth_user_id", user.id)
        .maybeSingle();
      
      // Then check appmaster_admins table
      const { data: adminData } = await supabase
        .from("appmaster_admins")
        .select("id, is_active")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();
      
      // User must have user_type='appmaster_admin' AND an active entry in appmaster_admins
      const isAdmin = 
        userData?.user_type === "appmaster_admin" && 
        !!adminData?.is_active;
      
      return { 
        isAdmin, 
        userType: userData?.user_type || null 
      };
    },
    enabled: !!user,
  });

  const isSuperAdmin = adminCheck?.isAdmin === true;

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
