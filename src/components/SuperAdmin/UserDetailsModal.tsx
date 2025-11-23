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
  User, Building2, Shield, Wrench, Activity, Clock, 
  CreditCard, ChevronDown, Mail, Phone, Calendar,
  Database, HardDrive, TrendingUp, RefreshCw, Monitor,
  AlertCircle, CheckCircle2, XCircle
} from "lucide-react";
import { toast } from "sonner";

interface UserDetailsModalProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh?: () => void;
}

export const UserDetailsModal = ({ userId, open, onOpenChange, onRefresh }: UserDetailsModalProps) => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [userTools, setUserTools] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [usageMetrics, setUsageMetrics] = useState<any>(null);
  const [moreDetailsOpen, setMoreDetailsOpen] = useState(false);

  useEffect(() => {
    if (open && userId) {
      fetchUserDetails();
    }
  }, [open, userId]);

  const fetchUserDetails = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Fetch user data with organization details
      const { data: user, error: userError } = await supabase
        .from("users")
        .select(`
          *,
          organisations!users_organisation_id_fkey (
            id,
            name,
            account_type,
            plan,
            active_tools,
            billing_email
          )
        `)
        .eq("id", userId)
        .single();

      if (userError) throw userError;

      // Fetch user's assigned tools with tool details
      const { data: tools, error: toolsError } = await supabase
        .from("user_tools")
        .select(`
          *,
          tool:tools(*)
        `)
        .eq("user_id", userId);

      if (toolsError) throw toolsError;

      // Fetch audit logs for this user
      const { data: logs, error: logsError } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(15);

      if (logsError) throw logsError;

      // Calculate real usage metrics from database
      // Count CRM records created by this user
      const { count: leadsCount } = await supabase
        .from("crm_leads")
        .select("*", { count: "exact", head: true })
        .eq("created_by", userId);

      const { count: contactsCount } = await supabase
        .from("crm_contacts")
        .select("*", { count: "exact", head: true })
        .eq("created_by", userId);

      const { count: dealsCount } = await supabase
        .from("crm_deals")
        .select("*", { count: "exact", head: true })
        .eq("created_by", userId);

      const { count: assetsCount } = await supabase
        .from("assets")
        .select("*", { count: "exact", head: true })
        .eq("created_by", userId);

      const totalRecords = (leadsCount || 0) + (contactsCount || 0) + (dealsCount || 0) + (assetsCount || 0);

      // Count total audit log actions (as proxy for API calls)
      const { count: auditCount } = await supabase
        .from("audit_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      const metrics = {
        totalTools: tools?.length || 0,
        activeTools: tools?.filter(t => t.tool?.active).length || 0,
        dataUsage: 0, // Real storage tracking would require additional implementation
        storageUsage: 0, // Real storage tracking would require additional implementation
        apiCalls: auditCount || 0,
        activeRecords: totalRecords,
        leadsCount: leadsCount || 0,
        contactsCount: contactsCount || 0,
        dealsCount: dealsCount || 0,
        assetsCount: assetsCount || 0,
      };

      setUserData(user);
      setUserTools(tools || []);
      setAuditLogs(logs || []);
      setUsageMetrics(metrics);
    } catch (error: any) {
      console.error("Error fetching user details:", error);
      toast.error("Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    toast.info(`${action} - Coming soon`);
  };

  if (!userId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">User Details</DialogTitle>
            <Button variant="ghost" size="sm" onClick={fetchUserDetails}>
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
            ) : userData ? (
              <>
                {/* Basic Information */}
                <section className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <User className="w-4 h-4 text-primary" />
                    <span>Basic Information</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-md">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Full Name</p>
                      <p className="text-sm font-medium">{userData.name || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        <p className="text-sm truncate">{userData.email}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        <p className="text-sm">{userData.phone || "Not provided"}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">User ID</p>
                      <p className="text-xs font-mono text-muted-foreground truncate">{userData.id}</p>
                    </div>
                  </div>
                </section>

                <Separator className="my-3" />

                {/* Organization & Account */}
                <section className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Building2 className="w-4 h-4 text-primary" />
                    <span>Organization & Account</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-md">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Organization</p>
                      <p className="text-sm font-medium">{userData.organisations?.name || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Account Type</p>
                      <Badge variant="outline" className="capitalize text-xs">
                        {userData.organisations?.account_type || "organization"}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">User Type</p>
                      <Badge variant="secondary" className="capitalize text-xs">
                        {userData.user_type || "organization"}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Plan</p>
                      <Badge variant="outline" className="capitalize text-xs">
                        {userData.organisations?.plan || "free"}
                      </Badge>
                    </div>
                  </div>
                </section>

                <Separator className="my-3" />

                {/* Status & Role */}
                <section className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Shield className="w-4 h-4 text-primary" />
                    <span>Status & Role</span>
                  </div>
                  <div className="flex gap-3 p-3 bg-muted/30 rounded-md">
                    <div className="flex-1 space-y-1">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge variant={userData.status === "active" ? "default" : "destructive"} className="text-xs">
                        {userData.status === "active" ? (
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                        ) : (
                          <XCircle className="w-3 h-3 mr-1" />
                        )}
                        {userData.status}
                      </Badge>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-xs text-muted-foreground">Role</p>
                      <Badge variant="outline" className="text-xs capitalize">{userData.role || "user"}</Badge>
                    </div>
                  </div>
                </section>

                <Separator className="my-3" />

                {/* Tools Assigned */}
                <section className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Wrench className="w-4 h-4 text-primary" />
                      <span>Tools Assigned ({userTools.length})</span>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {userTools.length === 0 ? (
                      <div className="p-3 bg-muted/30 rounded-md text-sm text-muted-foreground text-center">
                        No tools assigned
                      </div>
                    ) : (
                      userTools.map((userTool) => (
                        <div key={userTool.id} className="p-2.5 bg-muted/30 rounded-md space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">{userTool.tool?.name}</p>
                              {!userTool.tool?.active && (
                                <Badge variant="secondary" className="text-xs h-5">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Inactive (Super Admin Only)
                                </Badge>
                              )}
                            </div>
                            <Badge 
                              variant={userTool.tool?.active ? "default" : "secondary"} 
                              className="text-xs h-5"
                            >
                              {userTool.tool?.active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-xs">
                            <div>
                              <p className="text-muted-foreground">Assigned</p>
                              <p className="font-medium">
                                {new Date(userTool.assigned_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Key</p>
                              <p className="font-mono text-xs">{userTool.tool?.key}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Category</p>
                              <p>{userTool.tool?.category || "-"}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Access</p>
                              <p className="capitalize">Admin</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
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
                    <div className="p-2.5 bg-muted/30 rounded-md">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs text-muted-foreground">Total Tools</p>
                        <Database className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <p className="text-xl font-bold">{usageMetrics?.totalTools || 0}</p>
                      <Progress 
                        value={(usageMetrics?.activeTools / usageMetrics?.totalTools) * 100 || 0} 
                        className="h-1 mt-1.5" 
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {usageMetrics?.activeTools} active
                      </p>
                    </div>
                    <div className="p-2.5 bg-muted/30 rounded-md">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs text-muted-foreground">Actions</p>
                        <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <p className="text-xl font-bold">{usageMetrics?.apiCalls || 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">Total activities</p>
                    </div>
                    <div className="p-2.5 bg-muted/30 rounded-md">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs text-muted-foreground">Total Records</p>
                        <Database className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <p className="text-xl font-bold">{usageMetrics?.activeRecords || 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">All data</p>
                    </div>
                    <div className="p-2.5 bg-muted/30 rounded-md">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs text-muted-foreground">CRM Data</p>
                        <Database className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <p className="text-xl font-bold">
                        {(usageMetrics?.leadsCount || 0) + (usageMetrics?.contactsCount || 0) + (usageMetrics?.dealsCount || 0)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {usageMetrics?.leadsCount || 0} leads, {usageMetrics?.contactsCount || 0} contacts
                      </p>
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
                      <p className="text-xs text-muted-foreground">Account Created</p>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <p className="text-sm">{new Date(userData.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Last Login</p>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <p className="text-sm">
                          {userData.last_login ? new Date(userData.last_login).toLocaleDateString() : "Never"}
                        </p>
                      </div>
                    </div>
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
                        <p className="text-sm">{userData.organisations?.billing_email || "Not set"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Current Plan</p>
                        <p className="text-sm font-medium capitalize">
                          {userData.organisations?.plan || "free"}
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
                    {/* Recent Audit Logs */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Recent Activity Logs ({auditLogs.length})</p>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {auditLogs.length === 0 ? (
                          <p className="text-xs text-muted-foreground p-2.5 bg-muted/30 rounded-md text-center">
                            No activity logs found
                          </p>
                        ) : (
                          auditLogs.map((log) => (
                            <div key={log.id} className="p-2 bg-muted/30 rounded-md">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-medium">{log.action_type}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(log.created_at).toLocaleString()}
                                </p>
                              </div>
                              {log.entity_type && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Entity: {log.entity_type}
                                </p>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Device Information */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <Monitor className="w-3 h-3" />
                        Device Information
                      </p>
                      <div className="p-2.5 bg-muted/30 rounded-md text-xs text-muted-foreground">
                        Device tracking not yet implemented
                      </div>
                    </div>

                    {/* Suspensions/Warnings */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <AlertCircle className="w-3 h-3" />
                        Warnings & Suspensions
                      </p>
                      <div className="p-2.5 bg-muted/30 rounded-md text-xs text-center text-muted-foreground">
                        No warnings or suspensions
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </>
            ) : (
              <p className="text-center text-muted-foreground py-8">Failed to load user data</p>
            )}
          </div>
        </ScrollArea>

      </DialogContent>
    </Dialog>
  );
};
