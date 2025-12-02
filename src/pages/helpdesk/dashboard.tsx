import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, Package, AlertCircle, FileText, Wrench, CheckCircle2 } from "lucide-react";
import { useHelpdeskStats } from "@/hooks/useHelpdeskStats";
import { useITAMStats } from "@/hooks/useITAMStats";
import { DashboardStatCard } from "@/components/helpdesk/DashboardStatCard";
import { RecentTicketsList } from "@/components/helpdesk/RecentTicketsList";
import { SystemHealthMetrics } from "@/components/helpdesk/SystemHealthMetrics";
import { TicketStatsCards } from "@/components/helpdesk/TicketStatsCards";

export default function HelpdeskDashboard() {
  const { data: ticketStats } = useHelpdeskStats();
  const { data: assetStats } = useITAMStats();

  return (
    <div className="max-w-7xl space-y-6">
      {/* Ticket Stats Cards */}
      <TicketStatsCards />
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStatCard
          title="Total Tickets"
          value={ticketStats?.total || 0}
          icon={Ticket}
          color="text-blue-500"
          href="/helpdesk/tickets"
          subtitle={`${ticketStats?.recentTickets || 0} new this week`}
        />
        <DashboardStatCard
          title="Open Tickets"
          value={ticketStats?.open || 0}
          icon={AlertCircle}
          color="text-orange-500"
          href="/helpdesk/tickets?status=open"
          subtitle={ticketStats?.slaBreached ? `${ticketStats.slaBreached} SLA breached` : "On track"}
        />
        <DashboardStatCard
          title="Active Assets"
          value={assetStats?.totalAssets || 0}
          icon={Package}
          color="text-green-500"
          href="/helpdesk/assets"
          subtitle={`${assetStats?.assigned || 0} assigned`}
        />
        <DashboardStatCard
          title="KB Articles"
          value={0}
          icon={FileText}
          color="text-cyan-500"
          href="/helpdesk/kb"
          subtitle="Knowledge base"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardStatCard
          title="In Progress"
          value={ticketStats?.inProgress || 0}
          icon={Wrench}
          color="text-indigo-500"
          href="/helpdesk/tickets?status=in_progress"
        />
        <DashboardStatCard
          title="Resolved Today"
          value={ticketStats?.resolved || 0}
          icon={CheckCircle2}
          color="text-emerald-500"
          href="/helpdesk/tickets?status=resolved"
        />
        <DashboardStatCard
          title="Assets Assigned"
          value={assetStats?.assigned || 0}
          icon={Package}
          color="text-purple-500"
          href="/helpdesk/assets?status=assigned"
          subtitle="Currently in use"
        />
      </div>

      {/* ITAM Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assetStats?.totalAssets || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across all types</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Laptops</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assetStats?.laptops || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">In inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assetStats?.assigned || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">To employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Licenses</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assetStats?.licenses || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Active licenses</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentTicketsList />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <SystemHealthMetrics />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}