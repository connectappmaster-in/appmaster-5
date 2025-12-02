import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Edit, DollarSign, Calendar, Users, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

const SubscriptionDetail = () => {
  const { subscriptionId } = useParams();
  const navigate = useNavigate();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["subscription-detail", subscriptionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions_tools")
        .select("*, subscriptions_vendors(*)")
        .eq("id", subscriptionId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!subscriptionId,
  });

  const { data: costHistory = [] } = useQuery({
    queryKey: ["subscription-cost-history", subscriptionId],
    queryFn: async () => {
      const { data } = await supabase
        .from("subscription_cost_history")
        .select("*")
        .eq("subscription_id", subscriptionId)
        .order("billing_period_start", { ascending: false });
      return data || [];
    },
    enabled: !!subscriptionId,
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["subscription-alerts", subscriptionId],
    queryFn: async () => {
      const { data } = await supabase
        .from("subscription_alerts")
        .select("*")
        .eq("subscription_id", subscriptionId)
        .order("trigger_date", { ascending: false });
      return data || [];
    },
    enabled: !!subscriptionId,
  });

  const { data: licenses = [] } = useQuery({
    queryKey: ["subscription-licenses", subscriptionId],
    queryFn: async () => {
      const { data } = await supabase
        .from("subscriptions_licenses")
        .select("*")
        .eq("tool_id", subscriptionId);
      return data || [];
    },
    enabled: !!subscriptionId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <p>Loading subscription details...</p>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <p>Subscription not found</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "expiring_soon": return "bg-yellow-100 text-yellow-800";
      case "expired": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{subscription.tool_name}</h1>
                <Badge className={getStatusColor(subscription.status)}>
                  {subscription.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {subscription.subscriptions_vendors?.vendor_name}
              </p>
            </div>
          </div>

          <Button onClick={() => navigate(`/helpdesk/subscription/edit/${subscription.id}`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="seats">Seats ({licenses.length})</TabsTrigger>
            <TabsTrigger value="cost-history">Cost History</TabsTrigger>
            <TabsTrigger value="alerts">Alerts ({alerts.filter(a => !a.resolved).length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tool Name:</span>
                    <span className="font-medium">{subscription.tool_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vendor:</span>
                    <span className="font-medium">
                      {subscription.subscriptions_vendors?.vendor_name || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Renewal Date:
                    </span>
                    <span className="font-medium">
                      {format(new Date(subscription.renewal_date), "MMM dd, yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      <DollarSign className="h-4 w-4 inline mr-1" />
                      Cost:
                    </span>
                    <span className="font-medium">
                      ${subscription.cost}/{subscription.subscription_type === "monthly" ? "mo" : "yr"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>License Usage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      <Users className="h-4 w-4 inline mr-1" />
                      Total Seats:
                    </span>
                    <span className="font-medium">{subscription.license_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Used:</span>
                    <span className="font-medium">{licenses.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Available:</span>
                    <span className="font-medium">
                      {subscription.license_count - licenses.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Utilization:</span>
                    <span className="font-medium">
                      {subscription.license_count > 0 ? Math.round((licenses.length / subscription.license_count) * 100) : 0}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="seats" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Assigned Licenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {licenses.map((license: any) => (
                    <div key={license.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">User ID: {license.user_id}</p>
                          <p className="text-sm text-muted-foreground">
                            Assigned: {format(new Date(license.assigned_at), "MMM dd, yyyy")}
                          </p>
                        </div>
                        <Badge variant={license.status === "assigned" ? "default" : "secondary"}>
                          {license.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {licenses.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No licenses assigned yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cost-history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {costHistory.map((entry: any) => (
                    <div key={entry.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {format(new Date(entry.billing_period_start), "MMM dd, yyyy")} -{" "}
                            {format(new Date(entry.billing_period_end), "MMM dd, yyyy")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Invoice: {entry.invoice_number || "N/A"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${entry.cost}</p>
                          {entry.paid_date && (
                            <p className="text-sm text-muted-foreground">
                              Paid: {format(new Date(entry.paid_date), "MMM dd, yyyy")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {costHistory.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No billing history available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Alerts & Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.map((alert: any) => (
                    <div key={alert.id} className="p-4 border rounded-lg">
                      <div className="flex gap-3">
                        <AlertTriangle className="h-5 w-5 mt-1 text-yellow-600" />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium capitalize">
                                {alert.alert_type.replace(/_/g, " ")}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(alert.trigger_date), "MMM dd, yyyy HH:mm")}
                              </p>
                              {alert.notes && (
                                <p className="text-sm mt-2">{alert.notes}</p>
                              )}
                            </div>
                            <Badge variant={alert.resolved ? "secondary" : "default"}>
                              {alert.resolved ? "Resolved" : "Active"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {alerts.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No alerts
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SubscriptionDetail;
