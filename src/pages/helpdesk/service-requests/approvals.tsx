import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Approvals() {
  const queryClient = useQueryClient();
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [comments, setComments] = useState("");

  const { data: pendingApprovals, isLoading } = useQuery({
    queryKey: ["pending-approvals"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      const { data, error } = await supabase
        .from("srm_request_approvals")
        .select(`
          *
        `)
        .eq("approver_id", userData?.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: requests } = useQuery({
    queryKey: ["requests-for-approval"],
    queryFn: async () => {
      if (!pendingApprovals || pendingApprovals.length === 0) return [];

      const requestIds = pendingApprovals.map((a) => a.request_id);

      const { data, error } = await supabase
        .from("srm_requests")
        .select(`
          *,
          catalog:srm_catalog(name)
        `)
        .in("id", requestIds);

      if (error) throw error;
      return data;
    },
    enabled: !!pendingApprovals && pendingApprovals.length > 0,
  });

  const updateApproval = useMutation({
    mutationFn: async ({ approvalId, status, comments }: any) => {
      const { error } = await supabase
        .from("srm_request_approvals")
        .update({
          status,
          comments,
          updated_at: new Date().toISOString(),
        })
        .eq("id", approvalId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] });
      setSelectedApproval(null);
      setComments("");
      toast.success("Approval decision recorded");
    },
  });

  const handleApprove = (approval: any) => {
    updateApproval.mutate({
      approvalId: approval.id,
      status: "approved",
      comments,
    });
  };

  const handleReject = (approval: any) => {
    if (!comments.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    updateApproval.mutate({
      approvalId: approval.id,
      status: "rejected",
      comments,
    });
  };

  const getRequestForApproval = (approvalId: string) => {
    const approval = pendingApprovals?.find((a) => a.id === approvalId);
    return requests?.find((r) => r.id === approval?.request_id);
  };

  return (
    <div className="min-h-screen bg-background">
      <BackButton />
      <div className="container mx-auto py-4 px-4 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Approval Queue</h1>
          <p className="text-muted-foreground">Review and approve pending service requests</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : !pendingApprovals || pendingApprovals.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No pending approvals</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {pendingApprovals.map((approval) => {
                const request = getRequestForApproval(approval.id);
                return (
                  <Card
                    key={approval.id}
                    className={`cursor-pointer transition-all ${
                      selectedApproval?.id === approval.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedApproval(approval)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{request?.request_number}</h3>
                            <Badge>Step {approval.step_number}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {request?.catalog?.name || "Service Request"}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Submitted {format(new Date(request?.created_at || ""), "MMM d, yyyy")}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div>
              {selectedApproval ? (
                <Card className="sticky top-4">
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <h3 className="font-semibold mb-4">Approval Decision</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Request: {getRequestForApproval(selectedApproval.id)?.request_number}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Comments (optional for approval, required for rejection)</Label>
                      <Textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Add your comments..."
                        rows={4}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleApprove(selectedApproval)}
                        disabled={updateApproval.isPending}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleReject(selectedApproval)}
                        disabled={updateApproval.isPending}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">Select an approval to review</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
