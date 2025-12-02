import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Check } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const SubscriptionAlerts = () => {
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["subscription-alerts-all"],
    queryFn: async () => {
      const { data } = await supabase
        .from("subscription_alerts")
        .select("*, subscriptions_tools(tool_name)")
        .order("trigger_date", { ascending: false });
      return data || [];
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from("subscription_alerts")
        .update({ resolved: true, resolved_date: new Date().toISOString() })
        .eq("id", alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-alerts-all"] });
      toast.success("Alert resolved");
    },
  });

  const getAlertColor = (alertType: string) => {
    switch (alertType) {
      case "renewal_upcoming": return "bg-yellow-100 text-yellow-800";
      case "seat_overuse": return "bg-red-100 text-red-800";
      case "unused_seats": return "bg-blue-100 text-blue-800";
      case "cost_spike": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const activeAlerts = alerts.filter((a: any) => !a.resolved);
  const resolvedAlerts = alerts.filter((a: any) => a.resolved);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-2xl font-bold">Subscription Alerts</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{activeAlerts.length}</p>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{resolvedAlerts.length}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{alerts.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {activeAlerts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeAlerts.map((alert: any) => (
                  <div key={alert.id} className="p-4 border rounded-lg">
                    <div className="flex gap-3">
                      <AlertTriangle className="h-5 w-5 mt-1 text-yellow-600 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{alert.subscriptions_tools?.tool_name}</p>
                            <Badge className={getAlertColor(alert.alert_type)}>
                              {alert.alert_type.replace(/_/g, " ")}
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => resolveMutation.mutate(alert.id)}
                            disabled={resolveMutation.isPending}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Resolve
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(alert.trigger_date), "MMM dd, yyyy HH:mm")}
                        </p>
                        {alert.notes && (
                          <p className="text-sm mt-2">{alert.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {resolvedAlerts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resolved Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {resolvedAlerts.map((alert: any) => (
                  <div key={alert.id} className="p-4 border rounded-lg opacity-60">
                    <div className="flex gap-3">
                      <Check className="h-5 w-5 mt-1 text-green-600 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{alert.subscriptions_tools?.tool_name}</p>
                            <Badge variant="secondary">
                              {alert.alert_type.replace(/_/g, " ")}
                            </Badge>
                          </div>
                          <Badge variant="outline">Resolved</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Resolved: {format(new Date(alert.resolved_date), "MMM dd, yyyy HH:mm")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading alerts...</p>
          </div>
        )}

        {!isLoading && alerts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No alerts found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionAlerts;
