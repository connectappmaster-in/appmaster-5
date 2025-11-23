import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function TicketReports() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState("30days");
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf">("csv");

  const getDateRange = () => {
    const end = new Date();
    let start = new Date();

    switch (dateRange) {
      case "7days":
        start = subDays(end, 7);
        break;
      case "30days":
        start = subDays(end, 30);
        break;
      case "thisMonth":
        start = startOfMonth(end);
        break;
      case "90days":
        start = subDays(end, 90);
        break;
      default:
        start = subDays(end, 30);
    }

    return { start, end };
  };

  const { start, end } = getDateRange();

  const { data: ticketStats, isLoading } = useQuery({
    queryKey: ["ticket-reports", dateRange],
    queryFn: async () => {
      const { data: tickets, error } = await supabase
        .from("helpdesk_tickets")
        .select("*, category:helpdesk_categories(name)")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString());

      if (error) throw error;

      const total = tickets?.length || 0;
      const resolved = tickets?.filter((t) => t.status === "resolved").length || 0;
      const closed = tickets?.filter((t) => t.status === "closed").length || 0;
      const slaBreached = tickets?.filter((t) => t.sla_breached).length || 0;
      
      // Average resolution time (for resolved tickets)
      const resolvedTickets = tickets?.filter((t) => t.resolved_at) || [];
      const avgResolutionTime = resolvedTickets.length > 0
        ? resolvedTickets.reduce((acc, t) => {
            const created = new Date(t.created_at).getTime();
            const resolved = new Date(t.resolved_at!).getTime();
            return acc + (resolved - created);
          }, 0) / resolvedTickets.length / (1000 * 60 * 60) // Convert to hours
        : 0;

      // By priority
      const byPriority = {
        urgent: tickets?.filter((t) => t.priority === "urgent").length || 0,
        high: tickets?.filter((t) => t.priority === "high").length || 0,
        medium: tickets?.filter((t) => t.priority === "medium").length || 0,
        low: tickets?.filter((t) => t.priority === "low").length || 0,
      };

      // By category
      const categoryMap = new Map();
      tickets?.forEach((t) => {
        const catName = t.category?.name || "Uncategorized";
        categoryMap.set(catName, (categoryMap.get(catName) || 0) + 1);
      });
      const byCategory = Array.from(categoryMap.entries()).map(([name, count]) => ({
        name,
        count,
      }));

      return {
        total,
        resolved,
        closed,
        slaBreached,
        avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
        resolutionRate: total > 0 ? Math.round(((resolved + closed) / total) * 100) : 0,
        byPriority,
        byCategory,
      };
    },
  });

  const handleExport = () => {
    if (!ticketStats) return;

    if (exportFormat === "csv") {
      // Create CSV content
      const csvContent = [
        ["Ticket Reports", `${format(start, "MMM d, yyyy")} - ${format(end, "MMM d, yyyy")}`],
        [],
        ["Metric", "Value"],
        ["Total Tickets", ticketStats.total],
        ["Resolved Tickets", ticketStats.resolved],
        ["Closed Tickets", ticketStats.closed],
        ["SLA Breached", ticketStats.slaBreached],
        ["Resolution Rate", `${ticketStats.resolutionRate}%`],
        ["Avg Resolution Time", `${ticketStats.avgResolutionTime} hours`],
        [],
        ["Priority Distribution"],
        ["Urgent", ticketStats.byPriority.urgent],
        ["High", ticketStats.byPriority.high],
        ["Medium", ticketStats.byPriority.medium],
        ["Low", ticketStats.byPriority.low],
        [],
        ["Category Distribution"],
        ...ticketStats.byCategory.map((cat) => [cat.name, cat.count]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ticket-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
      a.click();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <BackButton />
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate("/helpdesk/tickets")}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tickets
            </Button>
            <h1 className="text-3xl font-bold">Ticket Reports & Analytics</h1>
            <p className="text-muted-foreground mt-2">
              {format(start, "MMM d, yyyy")} - {format(end, "MMM d, yyyy")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[160px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>

            <Select value={exportFormat} onValueChange={(v: any) => setExportFormat(v)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </CardContent>
          </Card>
        ) : ticketStats ? (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Tickets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{ticketStats.total}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Resolution Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{ticketStats.resolutionRate}%</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg Resolution Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{ticketStats.avgResolutionTime}h</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    SLA Breached
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">
                    {ticketStats.slaBreached}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Stats */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Resolved</span>
                    <Badge variant="secondary">{ticketStats.resolved}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Closed</span>
                    <Badge variant="secondary">{ticketStats.closed}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>In Progress</span>
                    <Badge variant="secondary">
                      {ticketStats.total - ticketStats.resolved - ticketStats.closed}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Priority Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Urgent</span>
                    <Badge className="bg-red-500">{ticketStats.byPriority.urgent}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>High</span>
                    <Badge className="bg-orange-500">{ticketStats.byPriority.high}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Medium</span>
                    <Badge className="bg-yellow-500">{ticketStats.byPriority.medium}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Low</span>
                    <Badge className="bg-green-500">{ticketStats.byPriority.low}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Tickets by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ticketStats.byCategory.map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between">
                      <span>{cat.name}</span>
                      <Badge variant="outline">{cat.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}
