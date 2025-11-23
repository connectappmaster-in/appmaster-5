import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useHelpdeskStats = () => {
  return useQuery({
    queryKey: ["helpdesk-dashboard-stats"],
    queryFn: async () => {
      const { data: tickets, error } = await supabase
        .from("helpdesk_tickets")
        .select("id, status, priority, sla_breached, created_at");

      if (error) throw error;

      const total = tickets?.length || 0;
      const open = tickets?.filter(t => t.status === "open").length || 0;
      const inProgress = tickets?.filter(t => t.status === "in_progress").length || 0;
      const resolved = tickets?.filter(t => t.status === "resolved").length || 0;
      const urgent = tickets?.filter(t => t.priority === "urgent").length || 0;
      const slaBreached = tickets?.filter(t => t.sla_breached).length || 0;

      // Calculate tickets created in last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentTickets = tickets?.filter(
        t => new Date(t.created_at) >= sevenDaysAgo
      ).length || 0;

      return {
        total,
        open,
        inProgress,
        resolved,
        urgent,
        slaBreached,
        recentTickets,
      };
    },
  });
};
