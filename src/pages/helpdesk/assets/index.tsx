import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganisation } from "@/contexts/OrganisationContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  UserCheck, 
  Wrench, 
  Archive,
  AlertTriangle,
  Key,
  Plus,
  FileText,
  TrendingUp,
  Settings
} from "lucide-react";
import { BackButton } from "@/components/BackButton";

const ITAMDashboard = () => {
  const navigate = useNavigate();
  const { organisation } = useOrganisation();

  // Fetch asset statistics
  const { data: assets = [] } = useQuery({
    queryKey: ["itam-assets", organisation?.id],
    queryFn: async () => {
      if (!organisation?.id) return [];
      const { data } = await supabase
        .from("itam_assets")
        .select("*")
        .eq("organisation_id", organisation.id)
        .eq("is_deleted", false);
      return data || [];
    },
    enabled: !!organisation?.id,
  });

  // Fetch repairs
  const { data: repairs = [] } = useQuery({
    queryKey: ["itam-repairs", organisation?.id],
    queryFn: async () => {
      if (!organisation?.id) return [];
      const { data } = await supabase
        .from("itam_repairs")
        .select("*")
        .in("status", ["pending", "in_progress"])
        .eq("is_deleted", false);
      return data || [];
    },
    enabled: !!organisation?.id,
  });

  // Fetch licenses
  const { data: licenses = [] } = useQuery({
    queryKey: ["itam-licenses", organisation?.id],
    queryFn: async () => {
      if (!organisation?.id) return [];
      const { data } = await supabase
        .from("itam_licenses")
        .select("*")
        .eq("organisation_id", organisation.id)
        .eq("is_deleted", false);
      return data || [];
    },
    enabled: !!organisation?.id,
  });

  // Calculate KPIs
  const totalAssets = assets.length;
  const availableAssets = assets.filter(a => a.status === "available").length;
  const assignedAssets = assets.filter(a => a.status === "assigned").length;
  const inRepairAssets = assets.filter(a => a.status === "in_repair").length;
  
  const totalLicenses = licenses.reduce((sum, l) => sum + l.seats_total, 0);
  const allocatedLicenses = licenses.reduce((sum, l) => sum + l.seats_allocated, 0);
  const licenseUtilization = totalLicenses > 0 ? ((allocatedLicenses / totalLicenses) * 100).toFixed(1) : 0;

  // Warranty expiring soon (30 days)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  const expiringWarranty = assets.filter(a => {
    if (!a.warranty_end) return false;
    const warrantyDate = new Date(a.warranty_end);
    return warrantyDate <= thirtyDaysFromNow && warrantyDate >= new Date();
  }).length;

  const stats = [
    {
      title: "Total Assets",
      value: totalAssets,
      icon: Package,
      description: `${availableAssets} available`,
      onClick: () => navigate("/helpdesk/assets/list"),
    },
    {
      title: "Assigned",
      value: assignedAssets,
      icon: UserCheck,
      description: "Currently in use",
      onClick: () => navigate("/helpdesk/assets/list?status=assigned"),
    },
    {
      title: "In Repair",
      value: inRepairAssets,
      icon: Wrench,
      description: `${repairs.length} active tickets`,
      onClick: () => navigate("/helpdesk/assets/repairs"),
    },
    {
      title: "Warranty Expiring",
      value: expiringWarranty,
      icon: AlertTriangle,
      description: "Within 30 days",
      onClick: () => navigate("/helpdesk/assets/list?warranty=expiring"),
    },
    {
      title: "License Utilization",
      value: `${licenseUtilization}%`,
      icon: Key,
      description: `${allocatedLicenses}/${totalLicenses} seats`,
      onClick: () => navigate("/helpdesk/assets/licenses"),
    },
  ];

  const quickActions = [
    {
      label: "Add Asset",
      icon: Plus,
      onClick: () => navigate("/helpdesk/assets/add"),
    },
    {
      label: "View Inventory",
      icon: Package,
      onClick: () => navigate("/helpdesk/assets/list"),
    },
    {
      label: "Assign Asset",
      icon: UserCheck,
      onClick: () => navigate("/helpdesk/assets/assign"),
    },
    {
      label: "Create Repair",
      icon: Wrench,
      onClick: () => navigate("/helpdesk/assets/repairs/create"),
    },
    {
      label: "Purchase Orders",
      icon: FileText,
      onClick: () => navigate("/helpdesk/assets/purchase-orders"),
    },
    {
      label: "Reports",
      icon: TrendingUp,
      onClick: () => navigate("/helpdesk/assets/reports"),
    },
    {
      label: "Tools",
      icon: Settings,
      onClick: () => navigate("/helpdesk/assets/tools"),
    },
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-3xl font-bold">IT Asset Management</h1>
              <p className="text-muted-foreground">
                Manage your organization's hardware, software, and licenses
              </p>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.map((stat) => (
            <Card 
              key={stat.title} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={stat.onClick}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common asset management tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={action.onClick}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Assets</CardTitle>
              <CardDescription>Latest additions to inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assets.slice(0, 5).map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => navigate(`/helpdesk/assets/detail/${asset.id}`)}
                  >
                    <div>
                      <p className="font-medium">{asset.name}</p>
                      <p className="text-sm text-muted-foreground">{asset.asset_tag}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      asset.status === "available" ? "bg-green-100 text-green-800" :
                      asset.status === "assigned" ? "bg-blue-100 text-blue-800" :
                      asset.status === "in_repair" ? "bg-yellow-100 text-yellow-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {asset.status}
                    </span>
                  </div>
                ))}
                {assets.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No assets yet. Add your first asset to get started.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Repairs</CardTitle>
              <CardDescription>Assets currently being serviced</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {repairs.slice(0, 5).map((repair) => (
                  <div
                    key={repair.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => navigate(`/helpdesk/assets/repairs/detail/${repair.id}`)}
                  >
                    <div>
                      <p className="font-medium">Repair #{repair.id}</p>
                      <p className="text-sm text-muted-foreground">{repair.issue_description?.substring(0, 50)}...</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      repair.status === "pending" ? "bg-gray-100 text-gray-800" :
                      repair.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                      "bg-green-100 text-green-800"
                    }`}>
                      {repair.status}
                    </span>
                  </div>
                ))}
                {repairs.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No active repairs
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ITAMDashboard;
