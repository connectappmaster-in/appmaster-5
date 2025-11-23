import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Server,
  Database,
  Globe,
  Cpu,
  HardDrive,
  Activity,
  Plus,
  RefreshCw,
  Settings,
  Bell,
  AlertCircle,
  TrendingUp,
  Search,
  BarChart3
} from "lucide-react";
import { MetricCard, Metric } from "@/components/Monitoring/MetricCard";
import { ServiceHealthCard, ServiceHealth } from "@/components/Monitoring/ServiceHealthCard";
import { IncidentCard, Incident } from "@/components/Monitoring/IncidentCard";
import { AddMonitorDialog } from "@/components/Monitoring/AddMonitorDialog";
import { ConfigureAlertDialog } from "@/components/Monitoring/ConfigureAlertDialog";
import { toast } from "sonner";

export default function Monitoring() {
  const [activeTab, setActiveTab] = useState("overview");
  const [addMonitorOpen, setAddMonitorOpen] = useState(false);
  const [configureAlertOpen, setConfigureAlertOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data - in production, this would come from your backend
  const [metrics, setMetrics] = useState<Metric[]>([
    {
      id: "1",
      name: "Server Status",
      value: "Online",
      status: "healthy",
      icon: Server,
      trend: "stable",
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Database",
      value: "Healthy",
      status: "healthy",
      icon: Database,
      trend: "stable",
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "3",
      name: "API Latency",
      value: 45,
      unit: "ms",
      status: "healthy",
      icon: Globe,
      trend: "down",
      threshold: 100,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "4",
      name: "CPU Usage",
      value: 23,
      unit: "%",
      status: "healthy",
      icon: Cpu,
      trend: "up",
      threshold: 80,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "5",
      name: "Memory",
      value: 67,
      unit: "%",
      status: "warning",
      icon: HardDrive,
      trend: "up",
      threshold: 85,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "6",
      name: "Disk Space",
      value: 42,
      unit: "%",
      status: "healthy",
      icon: HardDrive,
      trend: "stable",
      threshold: 90,
      lastUpdated: new Date().toISOString(),
    },
  ]);

  const [services, setServices] = useState<ServiceHealth[]>([
    {
      id: "1",
      name: "Ticketing System",
      status: "operational",
      uptime: 99.98,
      responseTime: 120,
      lastChecked: new Date().toISOString(),
      description: "Main helpdesk ticketing platform",
      url: "/helpdesk/tickets",
      incidents: 0,
    },
    {
      id: "2",
      name: "Asset Management",
      status: "operational",
      uptime: 99.95,
      responseTime: 85,
      lastChecked: new Date().toISOString(),
      description: "IT asset tracking and management",
      url: "/assets",
      incidents: 0,
    },
    {
      id: "3",
      name: "Knowledge Base",
      status: "operational",
      uptime: 99.99,
      responseTime: 65,
      lastChecked: new Date().toISOString(),
      description: "Self-service knowledge articles",
      url: "/helpdesk/kb",
      incidents: 0,
    },
    {
      id: "4",
      name: "Email Service",
      status: "degraded",
      uptime: 98.5,
      responseTime: 450,
      lastChecked: new Date().toISOString(),
      description: "Email notification system",
      incidents: 1,
    },
  ]);

  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: "1",
      title: "Email Service Degraded Performance",
      description: "Increased latency in email delivery system. Investigating root cause.",
      severity: "medium",
      status: "investigating",
      affectedServices: ["Email Service"],
      startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      assignedTo: "DevOps Team",
    },
  ]);

  // Auto-refresh metrics
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simulate metric updates
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        lastUpdated: new Date().toISOString(),
        value: typeof metric.value === 'number' 
          ? Math.max(0, Math.min(100, metric.value + (Math.random() - 0.5) * 5))
          : metric.value,
      })));
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleRefresh = () => {
    toast.info("Refreshing monitoring data...");
    // In production, this would fetch fresh data from the backend
    setMetrics(prev => prev.map(m => ({ ...m, lastUpdated: new Date().toISOString() })));
    setServices(prev => prev.map(s => ({ ...s, lastChecked: new Date().toISOString() })));
  };

  const handleAddMonitor = (monitor: any) => {
    const newMetric: Metric = {
      id: String(metrics.length + 1),
      name: monitor.name,
      value: 0,
      status: "healthy",
      icon: Activity,
      trend: "stable",
      lastUpdated: new Date().toISOString(),
    };
    setMetrics([...metrics, newMetric]);
    toast.success(`Monitor "${monitor.name}" added successfully`);
  };

  const handleConfigureAlert = (id: string) => {
    const metric = metrics.find(m => m.id === id);
    setSelectedMetric(metric?.name);
    setConfigureAlertOpen(true);
  };

  const handleSaveAlertConfig = (config: any) => {
    toast.success("Alert configuration saved successfully");
  };

  const handleResolveIncident = (id: string) => {
    setIncidents(prev => prev.map(inc =>
      inc.id === id
        ? { ...inc, status: 'resolved' as const, resolvedTime: new Date().toISOString() }
        : inc
    ));
    toast.success("Incident marked as resolved");
  };

  const filteredMetrics = metrics.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    healthy: metrics.filter(m => m.status === 'healthy').length,
    warnings: metrics.filter(m => m.status === 'warning').length,
    critical: metrics.filter(m => m.status === 'critical').length,
    activeIncidents: incidents.filter(i => i.status !== 'resolved').length,
  };

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Monitoring</h2>
          <p className="text-muted-foreground">
            Real-time infrastructure and service health monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? "border-primary" : ""}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-Refresh: {autoRefresh ? "On" : "Off"}
          </Button>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setAddMonitorOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Monitor
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Healthy</CardTitle>
            <Activity className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.healthy}</div>
            <p className="text-xs text-muted-foreground mt-1">All systems operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertCircle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.warnings}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.critical}</div>
            <p className="text-xs text-muted-foreground mt-1">Immediate action needed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
            <Bell className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeIncidents}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently tracking</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <TrendingUp className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="services">
            <Activity className="h-4 w-4 mr-2" />
            Services
          </TabsTrigger>
          <TabsTrigger value="incidents">
            <AlertCircle className="h-4 w-4 mr-2" />
            Incidents ({incidents.length})
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <Bell className="h-4 w-4 mr-2" />
            Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search metrics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMetrics.map((metric) => (
              <MetricCard
                key={metric.id}
                metric={metric}
                onConfigure={handleConfigureAlert}
                onClick={(id) => toast.info(`Viewing details for ${metric.name}`)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-3">
            {filteredServices.map((service) => (
              <ServiceHealthCard
                key={service.id}
                service={service}
                onViewDetails={(id) => toast.info(`Viewing details for ${service.name}`)}
                onViewIncidents={(id) => {
                  setActiveTab("incidents");
                  toast.info(`Showing incidents for ${service.name}`);
                }}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          {incidents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No incidents reported</p>
                <p className="text-sm text-muted-foreground mt-1">
                  All systems are operating normally
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {incidents.map((incident) => (
                <IncidentCard
                  key={incident.id}
                  incident={incident}
                  onViewDetails={(id) => toast.info("Viewing incident details")}
                  onResolve={handleResolveIncident}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Configure alert rules for your monitors
                </p>
                <Button onClick={() => setConfigureAlertOpen(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Alerts
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AddMonitorDialog
        open={addMonitorOpen}
        onOpenChange={setAddMonitorOpen}
        onAdd={handleAddMonitor}
      />

      <ConfigureAlertDialog
        open={configureAlertOpen}
        onOpenChange={setConfigureAlertOpen}
        monitorName={selectedMetric}
        onSave={handleSaveAlertConfig}
      />
    </div>
  );
}
