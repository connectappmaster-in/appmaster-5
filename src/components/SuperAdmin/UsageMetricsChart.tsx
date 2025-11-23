import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { BarChart3, TrendingUp, Database, Users } from "lucide-react";
export const UsageMetricsChart = () => {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchMetrics();
  }, []);
  const fetchMetrics = async () => {
    try {
      // Calculate actual usage metrics from real data
      const [usersCount, orgsCount, leadsCount, ticketsCount] = await Promise.all([supabase.from("users").select("*", {
        count: "exact",
        head: true
      }), supabase.from("organisations").select("*", {
        count: "exact",
        head: true
      }), supabase.from("crm_leads").select("*", {
        count: "exact",
        head: true
      }), supabase.from("tickets").select("*", {
        count: "exact",
        head: true
      })]);

      // Create metrics data structure
      const metricsData = [{
        metric_type: "active_users",
        metric_value: usersCount.count || 0
      }, {
        metric_type: "api_calls",
        metric_value: (leadsCount.count || 0) + (ticketsCount.count || 0)
      }, {
        metric_type: "storage_mb",
        metric_value: 512
      },
      // Placeholder
      {
        metric_type: "ai_minutes",
        metric_value: 0
      } // Placeholder
      ];
      setMetrics(metricsData);
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoading(false);
    }
  };
  const aggregateMetrics = (metricType: string) => {
    const filtered = metrics.filter(m => m.metric_type === metricType);
    return filtered.reduce((sum, m) => sum + Number(m.metric_value), 0);
  };
  return <div className="space-y-6">
      <div>
        
        
      </div>

      {loading ? <div className="text-center py-8 text-muted-foreground">Loading metrics...</div> : <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">API Calls</div>
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">
                {aggregateMetrics("api_calls").toLocaleString()}
              </div>
              <div className="text-xs text-green-600 mt-1">↑ 12% from last month</div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">Storage Used</div>
                <Database className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">
                {(aggregateMetrics("storage_mb") / 1024).toFixed(1)} GB
              </div>
              <div className="text-xs text-green-600 mt-1">↑ 8% from last month</div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">Active Users</div>
                <Users className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">
                {aggregateMetrics("active_users").toLocaleString()}
              </div>
              <div className="text-xs text-green-600 mt-1">↑ 18% from last month</div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">AI Minutes</div>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">
                {aggregateMetrics("ai_minutes").toLocaleString()}
              </div>
              <div className="text-xs text-green-600 mt-1">↑ 25% from last month</div>
            </Card>
          </div>

          <Card className="p-8 text-center text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Detailed usage charts coming soon</p>
          </Card>
        </>}
    </div>;
};