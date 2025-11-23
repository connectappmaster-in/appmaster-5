import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOrganisation } from "@/contexts/OrganisationContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ChangePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlanId?: string;
}

export const ChangePlanDialog = ({
  open,
  onOpenChange,
  currentPlanId,
}: ChangePlanDialogProps) => {
  const { organisation } = useOrganisation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // Fetch available plans
  const { data: plans, isLoading } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const changePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      if (!organisation?.id) {
        throw new Error("Organization not found");
      }

      const plan = plans?.find((p) => p.id === planId);
      if (!plan) {
        throw new Error("Plan not found");
      }

      // Update the subscription
      const { error } = await supabase
        .from("subscriptions")
        .update({
          plan_id: planId,
          plan_name: plan.plan_name,
          amount: plan.monthly_price,
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("organisation_id", organisation.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast({
        title: "Plan changed",
        description: "Your subscription plan has been updated successfully.",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to change plan",
        variant: "destructive",
      });
    },
  });

  const handleChangePlan = () => {
    if (selectedPlanId) {
      changePlanMutation.mutate(selectedPlanId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Change Your Plan</DialogTitle>
          <DialogDescription>
            Choose a plan that best fits your needs
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {plans?.map((plan) => (
              <Card
                key={plan.id}
                className={cn(
                  "cursor-pointer transition-all hover:border-primary",
                  selectedPlanId === plan.id && "border-primary ring-2 ring-primary",
                  currentPlanId === plan.id && "border-green-500"
                )}
                onClick={() => setSelectedPlanId(plan.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{plan.display_name}</CardTitle>
                    {currentPlanId === plan.id && (
                      <Badge variant="secondary">Current</Badge>
                    )}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-3xl font-bold">₹{plan.monthly_price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>
                        {plan.max_users === -1 ? "Unlimited" : plan.max_users} users
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>
                        {plan.max_tools === -1 ? "Unlimited" : plan.max_tools} tools
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>
                        {plan.max_storage_mb
                          ? `${plan.max_storage_mb / 1024}GB`
                          : "Unlimited"}{" "}
                        storage
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleChangePlan}
            disabled={!selectedPlanId || selectedPlanId === currentPlanId || changePlanMutation.isPending}
          >
            {changePlanMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Change Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
