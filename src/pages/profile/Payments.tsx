import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CreditCard, Plus, Download, Receipt, CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganisation } from "@/contexts/OrganisationContext";
import { useRole } from "@/hooks/useRole";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProfileSidebar } from "@/components/Profile/ProfileSidebar";
import { AddPaymentMethodDialog } from "@/components/Profile/AddPaymentMethodDialog";
import { ChangePlanDialog } from "@/components/Profile/ChangePlanDialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
const Payments = () => {
  const {
    user
  } = useAuth();
  const {
    organisation
  } = useOrganisation();
  const {
    isAdmin,
    accountType
  } = useRole();
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
  const [isChangePlanDialogOpen, setIsChangePlanDialogOpen] = useState(false);

  // Fetch current subscription
  const {
    data: subscription,
    isLoading: isLoadingSubscription
  } = useQuery({
    queryKey: ["subscription", organisation?.id],
    queryFn: async () => {
      if (!organisation?.id) return null;
      const {
        data,
        error
      } = await supabase.from("subscriptions").select(`
          *,
          subscription_plans (*)
        `).eq("organisation_id", organisation.id).order("created_at", {
        ascending: false
      }).limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!organisation?.id
  });

  // Fetch payment history
  const {
    data: paymentHistory,
    isLoading: isLoadingHistory
  } = useQuery({
    queryKey: ["payment-history", organisation?.id],
    queryFn: async () => {
      if (!organisation?.id) return [];
      const {
        data,
        error
      } = await supabase.from("saas_billing_history").select("*").eq("organisation_id", organisation.id).order("created_at", {
        ascending: false
      });
      if (error) throw error;
      return data || [];
    },
    enabled: !!organisation?.id
  });

  // Fetch payment methods
  const {
    data: paymentMethods,
    isLoading: isLoadingPaymentMethods
  } = useQuery({
    queryKey: ["payment-methods", organisation?.id],
    queryFn: async () => {
      if (!organisation?.id) return [];
      const {
        data,
        error
      } = await supabase.from("payment_methods").select("*").eq("organisation_id", organisation.id).order("created_at", {
        ascending: false
      });
      if (error) throw error;
      return data || [];
    },
    enabled: !!organisation?.id
  });
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "paid":
        return "bg-green-500/10 text-green-700 border-green-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
      case "failed":
      case "expired":
        return "bg-red-500/10 text-red-700 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  // Check if user has permission to view payments
  const hasAccess = accountType === 'personal' || isAdmin();
  return <div className="py-4 space-y-3">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-normal">Payments & Billing</h1>
            <p className="text-muted-foreground mt-1">
              Manage your subscription, payment methods, and billing history
            </p>
          </div>

          {/* Access Denied for non-admins in organization accounts */}
          {!hasAccess && <Alert variant="destructive" className="border-destructive/50 bg-destructive/5">
              <ShieldAlert className="h-5 w-5" />
              <AlertTitle className="text-lg font-semibold">Access Denied</AlertTitle>
              <AlertDescription className="mt-2">
                You don't have permission to view billing information. Please contact your Organization Admin for billing access.
              </AlertDescription>
            </Alert>}

          {/* Only show payment content if user has access */}
          {hasAccess && <>

          {/* Current Subscription */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Receipt className="h-4 w-4" />
                Current Subscription
              </CardTitle>
              
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              {isLoadingSubscription ? <div className="text-center py-8 text-muted-foreground">Loading subscription...</div> : subscription ? <>
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{subscription.plan_name}</h3>
                        <Badge className={`${getStatusColor(subscription.status || "")} text-xs px-2 py-0`}>
                          {subscription.status || "Unknown"}
                        </Badge>
                      </div>
                      {subscription.amount && <p className="text-xl font-bold text-primary">
                          ₹{subscription.amount}
                          <span className="text-xs font-normal text-muted-foreground">
                            /{subscription.period || "month"}
                          </span>
                        </p>}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setIsChangePlanDialogOpen(true)}>
                      Change Plan
                    </Button>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {subscription.next_billing_date && <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground">Next Billing Date</p>
                        <p className="text-sm font-medium">
                          {format(new Date(subscription.next_billing_date), "MMM dd, yyyy")}
                        </p>
                      </div>}
                    {subscription.renewal_date && <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground">Renewal Date</p>
                        <p className="text-sm font-medium">
                          {format(new Date(subscription.renewal_date), "MMM dd, yyyy")}
                        </p>
                      </div>}
                  </div>

                  {subscription.subscription_plans && <div className="space-y-2 pt-4 border-t">
                      <p className="text-sm font-medium">Plan Features:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span>Max Users: {subscription.subscription_plans.max_users === -1 ? "Unlimited" : subscription.subscription_plans.max_users}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span>Max Tools: {subscription.subscription_plans.max_tools === -1 ? "Unlimited" : subscription.subscription_plans.max_tools}</span>
                        </div>
                      </div>
                    </div>}
                </> : <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No active subscription found</p>
                  <Button>Subscribe Now</Button>
                </div>}
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CreditCard className="h-4 w-4" />
                    Payment Methods
                  </CardTitle>
                  
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsAddPaymentDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Method
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              {isLoadingPaymentMethods ? <div className="text-center py-8 text-muted-foreground">
                  Loading payment methods...
                </div> : paymentMethods && paymentMethods.length > 0 ? <div className="space-y-2">
                  {paymentMethods.map(method => <div key={method.id} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center">
                            <CreditCard className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              •••• •••• •••• {method.card_last4}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Expires {method.card_exp_month}/{method.card_exp_year}
                            </p>
                          </div>
                        </div>
                        {method.is_default && <Badge variant="secondary" className="text-xs">Default</Badge>}
                      </div>
                    </div>)}
                </div> : <div className="text-center py-8 text-muted-foreground">
                  Add a payment method to enable automatic billing
                </div>}
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Payment History</CardTitle>
              
            </CardHeader>
            <CardContent className="pt-2">
              {isLoadingHistory ? <div className="text-center py-8 text-muted-foreground">Loading payment history...</div> : paymentHistory && paymentHistory.length > 0 ? <div className="space-y-2">
                  {paymentHistory.map(payment => <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${payment.status === "paid" ? "bg-green-500/10" : "bg-yellow-500/10"}`}>
                          {payment.status === "paid" ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Clock className="h-4 w-4 text-yellow-600" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {format(new Date(payment.bill_period_start), "MMM dd")} - {format(new Date(payment.bill_period_end), "MMM dd, yyyy")}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className={`${getStatusColor(payment.status || "")} text-xs`}>
                              {payment.status || "Unknown"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {payment.payment_provider || "Stripe"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-base">₹{payment.amount}</span>
                        {payment.invoice_url && <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>}
                      </div>
                    </div>)}
                </div> : <div className="text-center py-8 text-muted-foreground">
                  No payment history available
                </div>}
            </CardContent>
          </Card>
          </>}

      {/* Dialogs - only available if user has access */}
      {hasAccess && <>
          <AddPaymentMethodDialog open={isAddPaymentDialogOpen} onOpenChange={setIsAddPaymentDialogOpen} />
          <ChangePlanDialog open={isChangePlanDialogOpen} onOpenChange={setIsChangePlanDialogOpen} currentPlanId={subscription?.plan_id || undefined} />
        </>}
    </div>;
};
export default Payments;