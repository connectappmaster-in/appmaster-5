import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444"];

export default function SRMReports() {
  const { data: stats } = useQuery({
    queryKey: ["srm-reports-stats"],
    queryFn: async () => {
      const { data: requests } = await supabase
        .from("srm_requests")
        .select("status, priority, created_at");
      
      if (!requests) return null;

      const total = requests.length;
      const fulfilled = requests.filter(r => r.status === "fulfilled").length;
      const pending = requests.filter(r => r.status === "pending").length;
      const rejected = requests.filter(r => r.status === "rejected").length;

      const byStatus = [
        { name: "Fulfilled", value: fulfilled },
        { name: "In Progress", value: requests.filter(r => r.status === "in_progress").length },
        { name: "Pending", value: pending },
        { name: "Rejected", value: rejected },
      ];

      const byPriority = [
        { name: "Urgent", value: requests.filter(r => r.priority === "urgent").length },
        { name: "High", value: requests.filter(r => r.priority === "high").length },
        { name: "Medium", value: requests.filter(r => r.priority === "medium").length },
        { name: "Low", value: requests.filter(r => r.priority === "low").length },
      ];

      return {
        total,
        fulfilled,
        pending,
        rejected,
        byStatus,
        byPriority,
        fulfillmentRate: total > 0 ? Math.round((fulfilled / total) * 100) : 0,
      };
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <BackButton />
      <div className="container mx-auto py-4 px-4 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">SRM Analytics</h1>
          <p className="text-muted-foreground">Service request management insights and metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Requests</p>
                  <p className="text-2xl font-bold">{stats?.total || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fulfilled</p>
                  <p className="text-2xl font-bold">{stats?.fulfilled || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/10 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats?.pending || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fulfillment Rate</p>
                  <p className="text-2xl font-bold">{stats?.fulfillmentRate || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Requests by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats?.byStatus || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(stats?.byStatus || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requests by Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats?.byPriority || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
