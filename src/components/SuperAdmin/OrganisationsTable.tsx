import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Search, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { OrganizationDetailsModal } from "./OrganizationDetailsModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

export const OrganisationsTable = () => {
  const [organisations, setOrganisations] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditPlanDialog, setShowEditPlanDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);
  const [newOrgData, setNewOrgData] = useState({
    name: "",
    domain: "",
    billing_email: "",
    plan_id: "",
    account_type: "organization"
  });
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [orgDetailsModalOpen, setOrgDetailsModalOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrganisations();
    fetchSubscriptionPlans();
  }, []);

  const fetchSubscriptionPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setSubscriptionPlans(data || []);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
    }
  };

  const fetchOrganisations = async () => {
    setLoading(true);
    setError(null);
    try {
      // Query actual organisations table with subscriptions
      // Filter out personal/individual accounts - only show true organizations
      const { data, error } = await supabase
        .from("organisations")
        .select(`
          *,
          subscriptions (
            plan_name,
            status,
            renewal_date
          )
        `)
        .eq("account_type", "organization")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("Fetched organisations:", data);
      
      // Get user counts for each org
      const orgsWithCounts = await Promise.all(
        (data || []).map(async (org) => {
          const { count } = await supabase
            .from("users")
            .select("*", { count: "exact", head: true })
            .eq("organisation_id", org.id)
            .eq("status", "active")
            .neq("user_type", "appmaster_admin");
          
          // Get total storage used (if you have storage metrics)
          const { count: toolsCount } = await supabase
            .from("subscriptions_tools")
            .select("*", { count: "exact", head: true })
            .eq("organisation_id", org.id);
          
          return {
            ...org,
            active_users_count: count || 0,
            tools_count: toolsCount || 0,
            plan_name: org.subscriptions?.[0]?.plan_name || org.plan,
            status: org.subscriptions?.[0]?.status || "active",
            next_billing_date: org.subscriptions?.[0]?.renewal_date,
            max_users_allowed: 100 // Default, should come from subscription limits
          };
        })
      );
      
      setOrganisations(orgsWithCounts);
    } catch (error: any) {
      console.error("Error fetching organisations:", error);
      setError(error.message || "Failed to load organisations");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrgs = organisations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "trial": return "bg-blue-500";
      case "suspended": return "bg-orange-500";
      case "cancelled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const handleSuspendOrg = async (org: any) => {
    try {
      const newStatus = org.status === "active" ? "suspended" : "active";
      
      // Update the subscription status for this organisation
      const { error } = await supabase
        .from("subscriptions")
        .update({ status: newStatus })
        .eq("organisation_id", org.id);

      if (error) throw error;

      toast({
        title: `Organisation ${newStatus === "suspended" ? "suspended" : "activated"}`,
        description: `${org.name} has been ${newStatus === "suspended" ? "suspended" : "activated"} successfully.`,
      });

      fetchOrganisations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteOrg = async () => {
    if (!selectedOrg) return;

    try {
      const { error } = await supabase
        .from("organisations")
        .delete()
        .eq("id", selectedOrg.id);

      if (error) throw error;

      toast({
        title: "Organisation deleted",
        description: `${selectedOrg.name} has been permanently deleted.`,
      });

      setShowDeleteDialog(false);
      setSelectedOrg(null);
      fetchOrganisations();
    } catch (error: any) {
      toast({
        title: "Error deleting organisation",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (org: any) => {
    setSelectedOrg(org);
    setShowDetailsDialog(true);
  };

  const handleEditPlan = (org: any) => {
    setSelectedOrg(org);
    setSelectedPlan(org.plan_id || "");
    setShowEditPlanDialog(true);
  };

  const handleSavePlan = async () => {
    if (!selectedOrg || !selectedPlan) return;

    try {
      // Update organisation plan
      const { error: orgError } = await supabase
        .from("organisations")
        .update({ plan_id: selectedPlan })
        .eq("id", selectedOrg.id);

      if (orgError) throw orgError;

      // Update or create subscription
      const selectedPlanData = subscriptionPlans.find(p => p.id === selectedPlan);
      const { error: subError } = await supabase
        .from("subscriptions")
        .upsert({
          organisation_id: selectedOrg.id,
          plan_id: selectedPlan,
          plan_name: selectedPlanData?.plan_name || "free",
          status: "active",
        });

      if (subError) throw subError;

      toast({
        title: "Plan updated",
        description: `${selectedOrg.name} has been updated to ${selectedPlanData?.display_name}`,
      });

      setShowEditPlanDialog(false);
      setSelectedOrg(null);
      fetchOrganisations();
    } catch (error: any) {
      toast({
        title: "Error updating plan",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleManageUsers = (org: any) => {
    navigate(`/super-admin/organization-users?orgId=${org.id}`);
  };

  const handleOrgClick = (orgId: string) => {
    setSelectedOrgId(orgId);
    setOrgDetailsModalOpen(true);
  };

  const handleCreateOrganisation = async () => {
    try {
      if (!newOrgData.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Organisation name is required",
          variant: "destructive",
        });
        return;
      }

      // Create the organisation
      const { data: orgData, error: orgError } = await supabase
        .from("organisations")
        .insert({
          name: newOrgData.name,
          domain: newOrgData.domain || null,
          billing_email: newOrgData.billing_email || null,
          plan_id: newOrgData.plan_id || null,
          account_type: "organization",
          plan: subscriptionPlans.find(p => p.id === newOrgData.plan_id)?.plan_name || "free"
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Create subscription if plan is selected
      if (newOrgData.plan_id && orgData) {
        const selectedPlanData = subscriptionPlans.find(p => p.id === newOrgData.plan_id);
        await supabase
          .from("subscriptions")
          .insert({
            organisation_id: orgData.id,
            plan_id: newOrgData.plan_id,
            plan_name: selectedPlanData?.plan_name || "free",
            status: "active",
          });
      }

      toast({
        title: "Success",
        description: `Organisation "${newOrgData.name}" has been created`,
      });

      setShowCreateDialog(false);
      setNewOrgData({
        name: "",
        domain: "",
        billing_email: "",
        plan_id: "",
        account_type: "organization"
      });
      fetchOrganisations();
    } catch (error: any) {
      toast({
        title: "Error creating organisation",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search organisations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchOrganisations} variant="outline" size="sm">
            Refresh
          </Button>
          <Button 
            onClick={() => setShowCreateDialog(true)} 
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Organisation
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organisation</TableHead>
              <TableHead>Domain</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Tools</TableHead>
              <TableHead>Billing Email</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Next Billing</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredOrgs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No organisations found matching your search" : "No organisations found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredOrgs.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">
                    <button
                      onClick={() => handleOrgClick(org.id)}
                      className="text-primary hover:underline cursor-pointer text-left"
                    >
                      {org.name}
                    </button>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {org.domain || "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{org.plan_name || org.plan || "Free"}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(org.status)}>
                      {org.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{org.active_users_count} / {org.max_users_allowed}</TableCell>
                  <TableCell>{org.tools_count || 0}</TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {org.billing_email || "—"}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(org.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {org.next_billing_date ? new Date(org.next_billing_date).toLocaleDateString() : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(org)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditPlan(org)}>
                          Edit Plan
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleManageUsers(org)}>
                          Manage Users
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleSuspendOrg(org)}>
                          {org.status === "active" ? "Suspend" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => {
                            setSelectedOrg(org);
                            setShowDeleteDialog(true);
                          }}
                        >
                          Delete Organisation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{selectedOrg?.name}</strong> and all associated data including users, subscriptions, and records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedOrg(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOrg} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Organisation Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedOrg?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                <p className="text-sm mt-1">{selectedOrg?.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Domain</Label>
                <p className="text-sm mt-1">{selectedOrg?.domain || "—"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Plan</Label>
                <p className="text-sm mt-1">{selectedOrg?.plan_name || "Free"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                <Badge className={`mt-1 ${getStatusColor(selectedOrg?.status)}`}>
                  {selectedOrg?.status}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Active Users</Label>
                <p className="text-sm mt-1">{selectedOrg?.active_users_count} / {selectedOrg?.max_users_allowed}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Tools Count</Label>
                <p className="text-sm mt-1">{selectedOrg?.tools_count || 0}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Billing Email</Label>
                <p className="text-sm mt-1">{selectedOrg?.billing_email || "—"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">GST Number</Label>
                <p className="text-sm mt-1">{selectedOrg?.gst_number || "—"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Created At</Label>
                <p className="text-sm mt-1">{selectedOrg?.created_at ? new Date(selectedOrg.created_at).toLocaleString() : "—"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Next Billing</Label>
                <p className="text-sm mt-1">{selectedOrg?.next_billing_date ? new Date(selectedOrg.next_billing_date).toLocaleDateString() : "N/A"}</p>
              </div>
            </div>
            {selectedOrg?.address && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                <p className="text-sm mt-1">{selectedOrg.address}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Plan Dialog */}
      <Dialog open={showEditPlanDialog} onOpenChange={setShowEditPlanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subscription Plan</DialogTitle>
            <DialogDescription>
              Change the subscription plan for {selectedOrg?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="plan">Select Plan</Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger id="plan">
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {subscriptionPlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.display_name} - ₹{plan.monthly_price}/mo
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowEditPlanDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSavePlan}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Organisation Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Organisation</DialogTitle>
            <DialogDescription>
              Add a new organisation to the system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organisation Name *</Label>
              <Input
                id="org-name"
                placeholder="Enter organisation name"
                value={newOrgData.name}
                onChange={(e) => setNewOrgData({ ...newOrgData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-domain">Domain</Label>
              <Input
                id="org-domain"
                placeholder="example.com"
                value={newOrgData.domain}
                onChange={(e) => setNewOrgData({ ...newOrgData, domain: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-billing-email">Billing Email</Label>
              <Input
                id="org-billing-email"
                type="email"
                placeholder="billing@example.com"
                value={newOrgData.billing_email}
                onChange={(e) => setNewOrgData({ ...newOrgData, billing_email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-plan">Subscription Plan</Label>
              <Select
                value={newOrgData.plan_id}
                onValueChange={(value) => setNewOrgData({ ...newOrgData, plan_id: value })}
              >
                <SelectTrigger id="org-plan">
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {subscriptionPlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setNewOrgData({
                  name: "",
                  domain: "",
                  billing_email: "",
                  plan_id: "",
                  account_type: "organization"
                });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateOrganisation}>
              Create Organisation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Organization Details Modal */}
      <OrganizationDetailsModal
        organizationId={selectedOrgId}
        open={orgDetailsModalOpen}
        onOpenChange={setOrgDetailsModalOpen}
        onRefresh={fetchOrganisations}
      />
    </div>
  );
};
