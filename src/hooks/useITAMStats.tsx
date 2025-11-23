import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useITAMStats = () => {
  return useQuery({
    queryKey: ["itam-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: userData } = await supabase
        .from("users")
        .select("organisation_id")
        .eq("auth_user_id", user.id)
        .single();

      const { data: profileData } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", user.id)
        .maybeSingle();

      const tenantId = profileData?.tenant_id || 1;
      const orgId = userData?.organisation_id;

      // Get total assets count
      let assetsQuery = supabase
        .from("assets")
        .select("*", { count: "exact", head: false });

      if (orgId) {
        assetsQuery = assetsQuery.eq("organisation_id", orgId);
      } else {
        assetsQuery = assetsQuery.eq("tenant_id", tenantId);
      }

      const { data: assets, count: totalAssets } = await assetsQuery;

      // Count by type
      const laptops = assets?.filter(a => 
        a.asset_type?.toLowerCase().includes('laptop')
      ).length || 0;

      // Get assigned assets count
      let assignmentsQuery = supabase
        .from("asset_assignments")
        .select("*", { count: "exact" })
        .is("returned_at", null);

      if (orgId) {
        assignmentsQuery = assignmentsQuery.eq("organisation_id", orgId);
      } else {
        assignmentsQuery = assignmentsQuery.eq("tenant_id", tenantId);
      }

      const { count: assignedCount } = await assignmentsQuery;

      // Get active licenses count
      let licensesQuery = supabase
        .from("asset_licenses")
        .select("*", { count: "exact" })
        .eq("status", "active");

      if (orgId) {
        licensesQuery = licensesQuery.eq("organisation_id", orgId);
      } else {
        licensesQuery = licensesQuery.eq("tenant_id", tenantId);
      }

      const { count: licensesCount } = await licensesQuery;

      return {
        totalAssets: totalAssets || 0,
        laptops,
        assigned: assignedCount || 0,
        licenses: licensesCount || 0,
      };
    },
  });
};
