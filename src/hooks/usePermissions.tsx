import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const usePermissions = () => {
  const { user, accountType } = useAuth();

  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ["permissions", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Personal accounts have access to all features
      if (accountType === 'personal') {
        return ['full_access'];
      }

      const { data: userData } = await supabase
        .from("users")
        .select("id, role")
        .eq("auth_user_id", user.id)
        .single();

      if (!userData) return [];

      // For organization accounts, fetch permissions based on role
      const { data: rolePerms } = await supabase
        .from("role_permissions")
        .select("permission:permissions(key)")
        .eq("role_id", userData.id);

      const { data: userPerms } = await supabase
        .from("user_permissions")
        .select("permission:permissions(key)")
        .eq("user_id", userData.id);

      const allPerms = [
        ...(rolePerms?.map((rp: any) => rp.permission?.key) || []),
        ...(userPerms?.map((up: any) => up.permission?.key) || []),
      ].filter(Boolean);

      return Array.from(new Set(allPerms));
    },
    enabled: !!user,
  });

  const hasPermission = (permission: string) => {
    // Personal accounts have full access
    if (accountType === 'personal' || permissions.includes('full_access')) {
      return true;
    }
    return permissions.includes(permission);
  };

  return { permissions, hasPermission, isLoading };
};
