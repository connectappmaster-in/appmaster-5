import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package, DollarSign, AlertTriangle, Calendar, TrendingUp, Users } from "lucide-react";
import { useOrganisation } from "@/contexts/OrganisationContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { convertToINR, formatINR } from "@/lib/currencyConversion";

export const SubscriptionsDashboard = () => {
  const { organisation } = useOrganisation();

  const { data: tools, isLoading: toolsLoading } = useQuery({
    queryKey: ["subscriptions-tools", organisation?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions_tools")
        .select("*, subscriptions_vendors(vendor_name)")
        .eq("organisation_id", organisation?.id!);
      
      if (error) throw error;
      return data;
    },
    enabled: !!organisation?.id,
  });

  // Calculate monthly burn rate with currency conversion
  const monthlyBurnRate = tools
    ?.filter(t => t.status === "active")
    .reduce((sum, tool) => {
      const licenseCount = tool.license_count || 1;
      const costInINR = convertToINR(Number(tool.cost) * licenseCount, tool.currency);
      return sum + costInINR;
    }, 0) || 0;

  // Calculate upcoming renewals with currency conversion
  const upcomingRenewals = tools
    ?.filter(t => {
      if (!t.renewal_date || t.status !== "active") return false;
      const daysUntil = Math.ceil((new Date(t.renewal_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil > 0 && daysUntil <= 30;
    })
    .map(t => ({
      tool_id: t.id,
      tool_name: t.tool_name,
      vendor_name: (t.subscriptions_vendors as any)?.vendor_name || "No vendor",
      renewal_date: t.renewal_date,
      days_until_renewal: Math.ceil((new Date(t.renewal_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      cost: convertToINR(Number(t.cost) * (t.license_count || 1), t.currency),
    }))
    .sort((a, b) => a.days_until_renewal - b.days_until_renewal) || [];

  const activeTools = tools?.filter(t => t.status === "active") || [];
  const expiringSoon = tools?.filter(t => {
    if (!t.renewal_date || t.status !== "active") return false;
    const daysUntil = Math.ceil((new Date(t.renewal_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil > 0 && daysUntil <= 7;
  }) || [];

  const annualCost = monthlyBurnRate * 12;

  const stats = [
    {
      title: "Active Tools",
      value: activeTools.length,
      icon: Package,
      description: `${tools?.filter(t => t.status === "trial").length || 0} in trial`,
      color: "text-primary",
    },
    {
      title: "Monthly Burn Rate",
      value: formatINR(monthlyBurnRate),
      icon: DollarSign,
      description: `${formatINR(annualCost)} annually`,
      color: "text-green-600",
    },
    {
      title: "Upcoming Renewals",
      value: upcomingRenewals.length,
      icon: Calendar,
      description: "Next 30 days",
      color: "text-blue-600",
    },
    {
      title: "Expiring Soon",
      value: expiringSoon.length,
      icon: AlertTriangle,
      description: "Within 7 days",
      color: "text-orange-600",
    },
  ];

  if (toolsLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      {expiringSoon.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{expiringSoon.length} subscription(s)</strong> expiring within 7 days. Review and renew to avoid service disruption.
          </AlertDescription>
        </Alert>
      )}

      {/* Upcoming Renewals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Renewals (Next 30 Days)
          </CardTitle>
          <CardDescription>
            Plan ahead for subscription renewals
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingRenewals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No renewals in the next 30 days</p>
          ) : (
            <div className="space-y-3">
              {upcomingRenewals.map((renewal: any) => (
                <div key={renewal.tool_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{renewal.tool_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {renewal.vendor_name}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={renewal.days_until_renewal <= 7 ? "destructive" : "secondary"}>
                      {renewal.days_until_renewal} days
                    </Badge>
                    <p className="text-sm font-medium">
                      {formatINR(renewal.cost)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Cost Distribution
          </CardTitle>
          <CardDescription>
            Subscription costs by type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {["monthly", "yearly", "per_user", "one_time"].map(type => {
              const typeCost = tools
                ?.filter(t => t.subscription_type === type && t.status === "active")
                .reduce((sum, t) => sum + convertToINR(Number(t.cost) * (t.license_count || 1), t.currency), 0) || 0;
              
              if (typeCost === 0) return null;

              return (
                <div key={type} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium capitalize">{type.replace("_", " ")}</p>
                    <p className="text-sm text-muted-foreground">
                      {tools?.filter(t => t.subscription_type === type && t.status === "active").length} tools
                    </p>
                  </div>
                  <p className="text-lg font-bold">
                    {formatINR(typeCost)}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
