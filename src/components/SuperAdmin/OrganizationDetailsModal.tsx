import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Building2, Users, Shield, Wrench, Activity, Clock, 
  CreditCard, ChevronDown, Mail, Calendar,
  Database, TrendingUp, RefreshCw,
  CheckCircle2, XCircle, User
} from "lucide-react";
import { toast } from "sonner";

interface OrganizationDetailsModalProps {
  organizationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh?: () => void;
}

export const OrganizationDetailsModal = ({ organizationId, open, onOpenChange, onRefresh }: OrganizationDetailsModalProps) => {
  const [loading, setLoading] = useState(true);
  const [orgData, setOrgData] = useState<any>(null);
  const [orgUsers, setOrgUsers] = useState<any[]>([]);
  const [usageMetrics, setUsageMetrics] = useState<any>(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [moreDetailsOpen, setMoreDetailsOpen] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (open && organizationId) {
      fetchOrganizationDetails();
    }
  }, [open, organizationId]);

  const fetchOrganizationDetails = async () => {
    if (!organizationId) return;
    
    setLoading(true);
    try {
      // Fetch organization data with subscription
      const { data: org, error: orgError } = await supabase
        .from("organisations")
        .select(`
          *,
          subscriptions (
            id,
            plan_id,
            plan_name,
            status,
            renewal_date,
            next_billing_date
          )
        `)
        .eq("id", organizationId)
        .single();

      if (orgError) throw orgError;

      // Fetch organization users
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select(`
          id,
          name,
          email,
          role,
          status,
          user_type,
          created_at,
          last_login
        `)
        .eq("organisation_id", organizationId)
        .neq("user_type", "appmaster_admin")
        .order("created_at", { ascending: false });

      if (usersError) throw usersError;

      // Get user tools count for each user
      const usersWithTools = await Promise.all(
        (users || []).map(async (user) => {
          const { count: toolsCount } = await supabase
            .from("user_tools")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id);

          return {
            ...user,
            tools_count: toolsCount || 0
          };
        })
      );

      // Calculate usage metrics
      const activeUsersCount = users?.filter(u => u.status === "active").length || 0;

      // Get total CRM records for this org
      const { count: leadsCount } = await supabase
        .from("crm_leads")
        .select("*", { count: "exact", head: true })
        .eq("organisation_id", organizationId);

      const { count: contactsCount } = await supabase
        .from("crm_contacts")
        .select("*", { count: "exact", head: true })
        .eq("organisation_id", organizationId);

      const { count: dealsCount } = await supabase
        .from("crm_deals")
        .select("*", { count: "exact", head: true })
        .eq("organisation_id", organizationId);

      const { count: assetsCount } = await supabase
        .from("assets")
        .select("*", { count: "exact", head: true })
        .eq("organisation_id", organizationId);

      // Get subscription tools count
      const { count: toolsCount } = await supabase
        .from("subscriptions_tools")
        .select("*", { count: "exact", head: true })
        .eq("organisation_id", organizationId);

      // Get audit logs count
      const { count: activityCount } = await supabase
        .from("audit_logs")
        .select("*", { count: "exact", head: true })
        .eq("organisation_id", organizationId);

      const totalRecords = (leadsCount || 0) + (contactsCount || 0) + (dealsCount || 0) + (assetsCount || 0);

      const metrics = {
        totalUsers: users?.length || 0,
        activeUsers: activeUsersCount,
        totalTools: toolsCount || 0,
        totalRecords: totalRecords,
        activityCount: activityCount || 0,
        leadsCount: leadsCount || 0,
        contactsCount: contactsCount || 0,
        dealsCount: dealsCount || 0,
        assetsCount: assetsCount || 0,
      };

      setOrgData(org);
      setOrgUsers(usersWithTools);
      setUsageMetrics(metrics);
      setSubscriptionInfo(org.subscriptions?.[0] || null);
    } catch (error: any) {
      console.error("Error fetching organization details:", error);
      toast.error("Failed to load organization details");
    } finally {
      setLoading(false);
    }
  };

  if (!organizationId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Organization Details</DialogTitle>
            <Button variant="ghost" size="sm" onClick={fetchOrganizationDetails}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-4">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : orgData ? (
              <>
                {/* Basic Information */}
                <section className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Building2 className="w-4 h-4 text-primary" />
                    <span>Basic Information</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-md">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Organization Name</p>
                      <p className="text-sm font-medium">{orgData.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Domain</p>
                      <p className="text-sm">{orgData.domain || "Not set"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Account Type</p>
                      <Badge variant="outline" className="capitalize text-xs">
                        {orgData.account_type || "organization"}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Organization ID</p>
                      <p className="text-xs font-mono text-muted-foreground truncate">{orgData.id}</p>
                    </div>
                  </div>
                </section>

                <Separator className="my-3" />

                {/* Subscription & Plan */}
                <section className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Shield className="w-4 h-4 text-primary" />
                    <span>Subscription & Plan</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-md">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Current Plan</p>
                      <Badge variant="outline" className="capitalize text-xs">
                        {subscriptionInfo?.plan_name || orgData.plan || "free"}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge 
                        variant={subscriptionInfo?.status === "active" ? "default" : "destructive"} 
                        className="text-xs"
                      >
                        {subscriptionInfo?.status === "active" ? (
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                        ) : (
                          <XCircle className="w-3 h-3 mr-1" />
                        )}
                        {subscriptionInfo?.status || "inactive"}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Next Billing</p>
                      <p className="text-sm">
                        {subscriptionInfo?.next_billing_date 
                          ? new Date(subscriptionInfo.next_billing_date).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Renewal Date</p>
                      <p className="text-sm">
                        {subscriptionInfo?.renewal_date 
                          ? new Date(subscriptionInfo.renewal_date).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </section>

                <Separator className="my-3" />

                {/* Usage Insights */}
                <section className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Activity className="w-4 h-4 text-primary" />
                    <span>Usage Insights</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {/* Total Users Card */}
                    <div 
                      className="p-2.5 bg-muted/30 rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setExpandedCard(expandedCard === 'users' ? null : 'users')}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs text-muted-foreground">Total Users</p>
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <p className="text-xl font-bold">{usageMetrics?.totalUsers || 0}</p>
                      <Progress 
                        value={(usageMetrics?.activeUsers / usageMetrics?.totalUsers) * 100 || 0} 
                        className="h-1 mt-1.5" 
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {usageMetrics?.activeUsers} active
                      </p>
                      {expandedCard === 'users' && (
                        <div className="mt-2 pt-2 border-t border-border space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Active:</span>
                            <span className="font-medium">{usageMetrics?.activeUsers}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Inactive:</span>
                            <span className="font-medium">{(usageMetrics?.totalUsers || 0) - (usageMetrics?.activeUsers || 0)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Utilization:</span>
                            <span className="font-medium">{Math.round((usageMetrics?.activeUsers / usageMetrics?.totalUsers) * 100 || 0)}%</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tools Card */}
                    <div 
                      className="p-2.5 bg-muted/30 rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setExpandedCard(expandedCard === 'tools' ? null : 'tools')}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs text-muted-foreground">Tools</p>
                        <Wrench className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <p className="text-xl font-bold">{usageMetrics?.totalTools || 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">Subscribed tools</p>
                      {expandedCard === 'tools' && (
                        <div className="mt-2 pt-2 border-t border-border space-y-1">
                          <p className="text-xs font-medium mb-1">Active Tools:</p>
                          {orgData?.active_tools && orgData.active_tools.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {orgData.active_tools.map((tool: string) => (
                                <Badge key={tool} variant="secondary" className="text-xs h-4 px-1.5">
                                  {tool}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">No tools active</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Activities Card */}
                    <div 
                      className="p-2.5 bg-muted/30 rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setExpandedCard(expandedCard === 'activities' ? null : 'activities')}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs text-muted-foreground">Activities</p>
                        <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <p className="text-xl font-bold">{usageMetrics?.activityCount || 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">Total actions</p>
                      {expandedCard === 'activities' && (
                        <div className="mt-2 pt-2 border-t border-border space-y-1">
                          <p className="text-xs text-muted-foreground">
                            All user actions and system events logged in audit logs
                          </p>
                          <div className="flex justify-between text-xs mt-1">
                            <span className="text-muted-foreground">Avg per user:</span>
                            <span className="font-medium">
                              {usageMetrics?.totalUsers > 0 
                                ? Math.round((usageMetrics?.activityCount || 0) / usageMetrics?.totalUsers)
                                : 0
                              }
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Records Card */}
                    <div 
                      className="p-2.5 bg-muted/30 rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setExpandedCard(expandedCard === 'records' ? null : 'records')}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs text-muted-foreground">Records</p>
                        <Database className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <p className="text-xl font-bold">{usageMetrics?.totalRecords || 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">CRM & Assets</p>
                      {expandedCard === 'records' && (
                        <div className="mt-2 pt-2 border-t border-border space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Leads:</span>
                            <span className="font-medium">{usageMetrics?.leadsCount || 0}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Contacts:</span>
                            <span className="font-medium">{usageMetrics?.contactsCount || 0}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Deals:</span>
                            <span className="font-medium">{usageMetrics?.dealsCount || 0}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Assets:</span>
                            <span className="font-medium">{usageMetrics?.assetsCount || 0}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <Separator className="my-3" />

                {/* Users List */}
                <section className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Users className="w-4 h-4 text-primary" />
                      <span>Users ({orgUsers.length})</span>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {orgUsers.length === 0 ? (
                      <div className="p-3 bg-muted/30 rounded-md text-sm text-muted-foreground text-center">
                        No users found
                      </div>
                    ) : (
                      orgUsers.map((user) => (
                        <div 
                          key={user.id} 
                          className="p-2.5 bg-muted/30 rounded-md space-y-1.5 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <User className="w-3.5 h-3.5 text-muted-foreground" />
                              <p className="text-sm font-medium">{user.name}</p>
                            </div>
                            <Badge 
                              variant={user.status === "active" ? "default" : "secondary"} 
                              className="text-xs h-5"
                            >
                              {user.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-xs">
                            <div>
                              <p className="text-muted-foreground">Email</p>
                              <p className="font-medium truncate">{user.email}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Role</p>
                              <p className="capitalize">{user.role || "user"}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Tools</p>
                              <p>{user.tools_count}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Type</p>
                              <p className="capitalize">{user.user_type || "organization"}</p>
                            </div>
                          </div>
                          
                          {/* Expanded User Details */}
                          {expandedUserId === user.id && (
                            <div className="mt-2 pt-2 border-t border-border space-y-2">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <p className="text-muted-foreground">User ID</p>
                                  <p className="font-mono text-xs truncate">{user.id}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Tools Assigned</p>
                                  <p className="font-medium">{user.tools_count} tools</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Created</p>
                                  <p>{new Date(user.created_at).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Last Login</p>
                                  <p>{user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </section>

                <Separator className="my-3" />

                {/* Billing Information */}
                <section className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <CreditCard className="w-4 h-4 text-primary" />
                    <span>Billing Information</span>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-md">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Billing Email</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          <p className="text-sm">{orgData.billing_email || "Not set"}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">GST Number</p>
                        <p className="text-sm">{orgData.gst_number || "Not set"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Address</p>
                        <p className="text-sm">{orgData.address || "Not set"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Timezone</p>
                        <p className="text-sm">{orgData.timezone || "Not set"}</p>
                      </div>
                    </div>
                  </div>
                </section>

                <Separator className="my-3" />

                {/* Activity History */}
                <section className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>Activity History</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-md">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Created</p>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <p className="text-sm">{new Date(orgData.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Last Updated</p>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <p className="text-sm">
                          {orgData.updated_at ? new Date(orgData.updated_at).toLocaleDateString() : "Never"}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <Separator className="my-3" />

                {/* More Details - Collapsible */}
                <Collapsible open={moreDetailsOpen} onOpenChange={setMoreDetailsOpen}>
                  <CollapsibleTrigger className="flex items-center gap-2 text-sm font-semibold hover:text-foreground/80 transition-colors w-full py-2">
                    <ChevronDown className={`w-4 h-4 text-primary transition-transform ${moreDetailsOpen ? 'rotate-180' : ''}`} />
                    <span>More Details</span>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 pt-2">
                    {/* CRM Data Breakdown */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">CRM Data Breakdown</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-muted/30 rounded-md">
                          <p className="text-xs text-muted-foreground">Leads</p>
                          <p className="text-lg font-bold">{usageMetrics?.leadsCount || 0}</p>
                        </div>
                        <div className="p-2 bg-muted/30 rounded-md">
                          <p className="text-xs text-muted-foreground">Contacts</p>
                          <p className="text-lg font-bold">{usageMetrics?.contactsCount || 0}</p>
                        </div>
                        <div className="p-2 bg-muted/30 rounded-md">
                          <p className="text-xs text-muted-foreground">Deals</p>
                          <p className="text-lg font-bold">{usageMetrics?.dealsCount || 0}</p>
                        </div>
                        <div className="p-2 bg-muted/30 rounded-md">
                          <p className="text-xs text-muted-foreground">Assets</p>
                          <p className="text-lg font-bold">{usageMetrics?.assetsCount || 0}</p>
                        </div>
                      </div>
                    </div>

                    {/* Active Tools */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Active Tools</p>
                      <div className="p-2.5 bg-muted/30 rounded-md">
                        {orgData.active_tools && orgData.active_tools.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {orgData.active_tools.map((tool: string) => (
                              <Badge key={tool} variant="outline" className="text-xs">
                                {tool}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground text-center">No active tools</p>
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </>
            ) : (
              <p className="text-center text-muted-foreground py-8">Failed to load organization data</p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
