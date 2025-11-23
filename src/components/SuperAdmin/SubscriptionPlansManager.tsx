import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Check } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
interface SubscriptionPlan {
  id: string;
  plan_name: string;
  display_name: string;
  plan_tier: string;
  monthly_price: number;
  yearly_price: number;
  max_users: number;
  max_tools: number;
  max_storage_mb: number;
  description: string | null;
  features: any;
  sort_order: number | null;
}
export const SubscriptionPlansManager = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState({
    plan_name: "",
    display_name: "",
    plan_tier: "",
    monthly_price: 0,
    yearly_price: 0,
    max_users: 3,
    max_tools: 1,
    max_storage_mb: 1024,
    description: ""
  });
  useEffect(() => {
    fetchPlans();
  }, []);
  const fetchPlans = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from("subscription_plans").select("*").order("sort_order", {
        ascending: true
      });
      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to load subscription plans");
    } finally {
      setLoading(false);
    }
  };
  const handleCreate = () => {
    setEditingPlan(null);
    setFormData({
      plan_name: "",
      display_name: "",
      plan_tier: "",
      monthly_price: 0,
      yearly_price: 0,
      max_users: 3,
      max_tools: 1,
      max_storage_mb: 1024,
      description: ""
    });
    setDialogOpen(true);
  };
  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      plan_name: plan.plan_name,
      display_name: plan.display_name,
      plan_tier: plan.plan_tier,
      monthly_price: plan.monthly_price,
      yearly_price: plan.yearly_price,
      max_users: plan.max_users,
      max_tools: plan.max_tools,
      max_storage_mb: plan.max_storage_mb,
      description: plan.description || ""
    });
    setDialogOpen(true);
  };
  const handleSave = async () => {
    try {
      if (editingPlan) {
        // Update existing plan
        const {
          error
        } = await supabase.from("subscription_plans").update({
          plan_name: formData.plan_name,
          display_name: formData.display_name,
          plan_tier: formData.plan_tier,
          monthly_price: formData.monthly_price,
          yearly_price: formData.yearly_price,
          max_users: formData.max_users,
          max_tools: formData.max_tools,
          max_storage_mb: formData.max_storage_mb,
          description: formData.description
        }).eq("id", editingPlan.id);
        if (error) throw error;
        toast.success("Plan updated successfully");
      } else {
        // Create new plan
        const {
          error
        } = await supabase.from("subscription_plans").insert([{
          plan_name: formData.plan_name,
          display_name: formData.display_name,
          plan_tier: formData.plan_tier,
          monthly_price: formData.monthly_price,
          yearly_price: formData.yearly_price,
          max_users: formData.max_users,
          max_tools: formData.max_tools,
          max_storage_mb: formData.max_storage_mb,
          description: formData.description,
          features: {}
        }]);
        if (error) throw error;
        toast.success("Plan created successfully");
      }
      setDialogOpen(false);
      fetchPlans();
    } catch (error: any) {
      console.error("Error saving plan:", error);
      toast.error(error.message || "Failed to save plan");
    }
  };
  const handleDelete = async (planId: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    try {
      const {
        error
      } = await supabase.from("subscription_plans").delete().eq("id", planId);
      if (error) throw error;
      toast.success("Plan deleted successfully");
      fetchPlans();
    } catch (error: any) {
      console.error("Error deleting plan:", error);
      toast.error(error.message || "Failed to delete plan");
    }
  };
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          
          
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Plan
        </Button>
      </div>

      {loading ? <div className="text-center py-8 text-muted-foreground">Loading plans...</div> : plans.length === 0 ? <div className="text-center py-8 text-muted-foreground">
          No subscription plans found. Create your first plan to get started.
        </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map(plan => <Card key={plan.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{plan.display_name}</h3>
                    <Badge variant="outline" className="mt-1">
                      {plan.plan_name}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-3xl font-bold">
                    ₹{plan.monthly_price}
                    <span className="text-sm text-muted-foreground font-normal">/month</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ₹{plan.yearly_price}/year
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>
                      {plan.max_users === -1 ? "Unlimited" : plan.max_users} users
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>
                      {plan.max_tools === -1 ? "Unlimited" : plan.max_tools} tools
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>{plan.max_storage_mb}MB storage</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(plan)}>
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(plan.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>)}
        </div>}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? "Edit Subscription Plan" : "Create New Subscription Plan"}
            </DialogTitle>
            <DialogDescription>
              Configure the pricing tier and limits for this subscription plan
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plan_name">Plan ID</Label>
              <Input id="plan_name" value={formData.plan_name} onChange={e => setFormData({
              ...formData,
              plan_name: e.target.value
            })} placeholder="e.g., free, starter, pro" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input id="display_name" value={formData.display_name} onChange={e => setFormData({
              ...formData,
              display_name: e.target.value
            })} placeholder="e.g., Free, Starter, Pro" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan_tier">Plan Tier</Label>
              <Input id="plan_tier" value={formData.plan_tier} onChange={e => setFormData({
              ...formData,
              plan_tier: e.target.value
            })} placeholder="e.g., free, starter, pro" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly_price">Monthly Price (₹)</Label>
              <Input id="monthly_price" type="number" value={formData.monthly_price} onChange={e => setFormData({
              ...formData,
              monthly_price: parseFloat(e.target.value) || 0
            })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearly_price">Yearly Price (₹)</Label>
              <Input id="yearly_price" type="number" value={formData.yearly_price} onChange={e => setFormData({
              ...formData,
              yearly_price: parseFloat(e.target.value) || 0
            })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_users">Max Users (-1 for unlimited)</Label>
              <Input id="max_users" type="number" value={formData.max_users} onChange={e => setFormData({
              ...formData,
              max_users: parseInt(e.target.value) || 0
            })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_tools">Max Tools (-1 for unlimited)</Label>
              <Input id="max_tools" type="number" value={formData.max_tools} onChange={e => setFormData({
              ...formData,
              max_tools: parseInt(e.target.value) || 0
            })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_storage_mb">Max Storage (MB)</Label>
              <Input id="max_storage_mb" type="number" value={formData.max_storage_mb} onChange={e => setFormData({
              ...formData,
              max_storage_mb: parseInt(e.target.value) || 0
            })} />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea id="description" value={formData.description} onChange={e => setFormData({
              ...formData,
              description: e.target.value
            })} placeholder="Brief description of the plan" rows={3} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingPlan ? "Update Plan" : "Create Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
};