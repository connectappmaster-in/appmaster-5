import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  draft: "bg-gray-500",
  submitted: "bg-yellow-500",
  approved: "bg-blue-500",
  scheduled: "bg-purple-500",
  in_progress: "bg-orange-500",
  completed: "bg-green-500",
  failed: "bg-red-500",
  cancelled: "bg-gray-400",
};

export default function ChangeApprovals() {
  const [comments, setComments] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const { data: approvals, isLoading } = useQuery({
    queryKey: ["change-approvals-queue"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      const { data, error } = await supabase
        .from("change_approvals")
        .select(`
          *,
          change:change_requests(*)
        `)
        .eq("approver_id", userData?.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, status, comment }: { id: string; status: string; comment: string }) => {
      const { error } = await supabase
        .from("change_approvals")
        .update({
          status,
          comments: comment,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["change-approvals-queue"] });
      toast.success("Approval decision submitted");
      setComments({});
    },
    onError: () => {
      toast.error("Failed to submit approval decision");
    },
  });

  const handleApprove = (approvalId: string) => {
    approveMutation.mutate({
      id: approvalId,
      status: "approved",
      comment: comments[approvalId] || "",
    });
  };

  const handleReject = (approvalId: string) => {
    if (!comments[approvalId]) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    approveMutation.mutate({
      id: approvalId,
      status: "rejected",
      comment: comments[approvalId],
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <BackButton />
      <div className="container mx-auto py-4 px-4 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Change Approvals</h1>
          <p className="text-muted-foreground">Review and approve pending change requests</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : !approvals || approvals.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No pending approvals</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {approvals.map((approval: any) => (
              <Card key={approval.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{approval.change?.change_number}</h3>
                        <Badge className={statusColors[approval.change?.status] || "bg-gray-500"}>
                          {approval.change?.status}
                        </Badge>
                        <Badge variant="outline">{approval.change?.risk} Risk</Badge>
                      </div>
                      <p className="font-medium mb-2">{approval.change?.title}</p>
                      <p className="text-sm text-muted-foreground">{approval.change?.description}</p>
                    </div>

                    {approval.change?.impact && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-semibold mb-1">Impact Assessment</p>
                        <p className="text-sm">{approval.change.impact}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Approval Step: </span>
                        <span className="font-medium">Step {approval.step_number}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Submitted: </span>
                        <span className="font-medium">
                          {format(new Date(approval.created_at), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Comments</label>
                      <Textarea
                        placeholder="Add your comments (required for rejection)..."
                        value={comments[approval.id] || ""}
                        onChange={(e) => setComments({ ...comments, [approval.id]: e.target.value })}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        onClick={() => handleApprove(approval.id)}
                        disabled={approveMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleReject(approval.id)}
                        disabled={approveMutation.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
