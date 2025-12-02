import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAssetReports = () => {
  return useQuery({
    queryKey: ["asset-reports"],
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

      // Fetch all assets
      let assetsQuery = supabase.from("assets").select("*");
      if (orgId) {
        assetsQuery = assetsQuery.eq("organisation_id", orgId);
      } else {
        assetsQuery = assetsQuery.eq("tenant_id", tenantId);
      }
      const { data: assets } = await assetsQuery;

      // Fetch assignments
      let assignmentsQuery = supabase
        .from("asset_assignments")
        .select("*, assets(name)");
      if (orgId) {
        assignmentsQuery = assignmentsQuery.eq("organisation_id", orgId);
      } else {
        assignmentsQuery = assignmentsQuery.eq("tenant_id", tenantId);
      }
      const { data: assignments } = await assignmentsQuery;

      // Fetch maintenance records
      let maintenanceQuery = supabase
        .from("asset_maintenance")
        .select("*");
      const { data: maintenance } = await maintenanceQuery;

      // Fetch licenses
      let licensesQuery = supabase.from("asset_licenses").select("*");
      if (orgId) {
        licensesQuery = licensesQuery.eq("organisation_id", orgId);
      } else {
        licensesQuery = licensesQuery.eq("tenant_id", tenantId);
      }
      const { data: licenses } = await licensesQuery;

      // Fetch warranties
      const { data: warranties } = await supabase
        .from("asset_warranties")
        .select("*");

      // Fetch depreciation entries
      const { data: depreciation } = await supabase
        .from("depreciation_entries")
        .select("*")
        .eq("posted", true);

      return {
        assets: assets || [],
        assignments: assignments || [],
        maintenance: maintenance || [],
        licenses: licenses || [],
        warranties: warranties || [],
        depreciation: depreciation || [],
      };
    },
  });
};
