import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSRMStats = () => {
  return useQuery({
    queryKey: ["srm-stats"],
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

      let requestsQuery = supabase
        .from("srm_requests")
        .select("*", { count: "exact", head: false });

      if (orgId) {
        requestsQuery = requestsQuery.eq("organisation_id", orgId);
      } else {
        requestsQuery = requestsQuery.eq("tenant_id", tenantId);
      }

      const { data: requests, count: total } = await requestsQuery;

      const pending = requests?.filter(r => r.status === "pending").length || 0;
      const approved = requests?.filter(r => r.status === "approved").length || 0;
      const inProgress = requests?.filter(r => r.status === "in_progress").length || 0;
      const fulfilled = requests?.filter(r => r.status === "fulfilled").length || 0;

      return {
        total: total || 0,
        pending,
        approved,
        inProgress,
        fulfilled,
      };
    },
  });
};
