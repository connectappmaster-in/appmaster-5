import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Calendar, Users, Package, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Subscription {
  id: string;
  plan_name: string;
  status: string;
  amount: number;
  renewal_date: string;
  plan_id: string;
  period: string;
}

interface SubscriptionPlan {
  display_name: string;
  max_users: number;
  max_tools: number;
  features: any;
}

export const OrgBillingManager = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [planDetails, setPlanDetails] = useState<SubscriptionPlan | null>(null);
  const [organisation, setOrganisation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillingData();
  }, [user]);

  const fetchBillingData = async () => {
    if (!user) return;

    try {
      // Get user's organization
      const { data: userData } = await supabase
        .from("users")
        .select("organisation_id")
        .eq("auth_user_id", user.id)
        .single();

      if (!userData) return;

      // Get organization details
      const { data: orgData, error: orgError } = await supabase
        .from("organisations")
        .select("*")
        .eq("id", userData.organisation_id)
        .single();

      if (orgError) throw orgError;
      setOrganisation(orgData);

      // Get current subscription
      const { data: subData, error: subError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("organisation_id", userData.organisation_id)
        .eq("status", "active")
        .single();

      if (subError && subError.code !== "PGRST116") throw subError;
      setSubscription(subData);

      // Get plan details if subscription exists
      if (subData?.plan_id) {
        const { data: planData, error: planError } = await supabase
          .from("subscription_plans")
          .select("display_name, max_users, max_tools, features")
          .eq("id", subData.plan_id)
          .single();

        if (planError) throw planError;
        setPlanDetails(planData);
      }
    } catch (error) {
      console.error("Error fetching billing data:", error);
      toast.error("Failed to load billing information");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading billing information...
      </div>
    );
  }

  const daysUntilRenewal = subscription?.renewal_date
    ? Math.ceil(
        (new Date(subscription.renewal_date).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Current Subscription
          </CardTitle>
          <CardDescription>
            Your organization's active subscription plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">
                    {planDetails?.display_name || subscription.plan_name}
                  </h3>
                  <Badge
                    variant={
                      subscription.status === "active"
                        ? "default"
                        : subscription.status === "expired"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {subscription.status}
                  </Badge>
                </div>
                {subscription.amount && (
                  <div className="text-right">
                    <div className="text-3xl font-bold">
                      ₹{subscription.amount}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      /{subscription.period || "month"}
                    </div>
                  </div>
                )}
              </div>

              {subscription.renewal_date && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Renews on{" "}
                    {format(new Date(subscription.renewal_date), "PPP")}
                  </span>
                  {daysUntilRenewal !== null && daysUntilRenewal < 30 && (
                    <Badge variant="outline" className="ml-2">
                      {daysUntilRenewal} days left
                    </Badge>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex items-start gap-2 p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">No active subscription</p>
                <p className="text-sm text-yellow-700">
                  Contact your administrator to activate a subscription plan
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Limits Card */}
      {planDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Plan Limits & Features</CardTitle>
            <CardDescription>Current usage and available resources</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Max Users</div>
                  <div className="text-lg font-semibold">
                    {planDetails.max_users === -1 ? "Unlimited" : planDetails.max_users}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Package className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Max Tools</div>
                  <div className="text-lg font-semibold">
                    {planDetails.max_tools === -1 ? "Unlimited" : planDetails.max_tools}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Organization Details Card */}
      {organisation && (
        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Organization Name:</span>
                <p className="font-medium">{organisation.name}</p>
              </div>
              {organisation.billing_email && (
                <div>
                  <span className="text-muted-foreground">Billing Email:</span>
                  <p className="font-medium">{organisation.billing_email}</p>
                </div>
              )}
              {organisation.gst_number && (
                <div>
                  <span className="text-muted-foreground">GST Number:</span>
                  <p className="font-medium">{organisation.gst_number}</p>
                </div>
              )}
              {organisation.address && (
                <div>
                  <span className="text-muted-foreground">Address:</span>
                  <p className="font-medium">{organisation.address}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
