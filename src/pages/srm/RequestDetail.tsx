import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2, Clock, User, FileText, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  approved: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  in_progress: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  completed: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  cancelled: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
  medium: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  high: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  urgent: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
};

export default function RequestDetail() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [newStatus, setNewStatus] = useState("");

  const { data: request, isLoading } = useQuery({
    queryKey: ["srm-request", requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("srm_requests")
        .select(`
          *,
          catalog_item:srm_catalog(*),
          requester:users!srm_requests_requester_id_fkey(name, email),
          assignee:users!srm_requests_assignee_id_fkey(name, email)
        `)
        .eq("id", parseInt(requestId!))
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["srm-comments", requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("srm_request_comments")
        .select("*, user:users(name, email)")
        .eq("request_id", parseInt(requestId!))
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: approvals = [] } = useQuery({
    queryKey: ["srm-approvals", requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("srm_approvals")
        .select("*, approver:users(name, email)")
        .eq("request_id", parseInt(requestId!))
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: request?.approval_required || false,
  });

  const addComment = useMutation({
    mutationFn: async (commentText: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: userData } = await supabase
        .from("users")
        .select("id, organisation_id")
        .eq("auth_user_id", user.id)
        .single();

      const { data: profileData } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", user.id)
        .maybeSingle();

      const { error } = await supabase.from("srm_request_comments").insert({
        request_id: parseInt(requestId!),
        user_id: userData?.id,
        comment: commentText,
        is_internal: false,
        tenant_id: profileData?.tenant_id || 1,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Comment added");
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["srm-comments", requestId] });
    },
    onError: (error: Error) => {
      toast.error("Failed to add comment: " + error.message);
    },
  });

  const updateStatus = useMutation({
    mutationFn: async (status: string) => {
      const updates: any = { status };
      
      if (status === "completed") {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("srm_requests")
        .update(updates)
        .eq("id", parseInt(requestId!));

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status updated");
      setNewStatus("");
      queryClient.invalidateQueries({ queryKey: ["srm-request", requestId] });
      queryClient.invalidateQueries({ queryKey: ["srm-requests"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to update status: " + error.message);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-4">
        <BackButton />
        <div className="text-center mt-8">Request not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <BackButton />
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold">{request.request_number}</h1>
            <div className="flex gap-2">
              <Badge className={statusColors[request.status] || ""}>
                {request.status.replace("_", " ").toUpperCase()}
              </Badge>
              <Badge className={priorityColors[request.priority] || ""}>
                {request.priority.toUpperCase()}
              </Badge>
            </div>
          </div>
          <p className="text-muted-foreground">
            {request.catalog_item?.name || "Service Request"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Details */}
            <Card>
              <CardHeader>
                <CardTitle>Request Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {request.catalog_item?.description && (
                  <div>
                    <p className="text-sm font-medium mb-1">Service</p>
                    <p className="text-sm text-muted-foreground">
                      {request.catalog_item.description}
                    </p>
                  </div>
                )}

                {request.form_data && Object.keys(request.form_data).length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Form Data</p>
                    <div className="space-y-2">
                      {Object.entries(request.form_data).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{key}:</span>
                          <span>{value as string}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {request.additional_notes && (
                  <div>
                    <p className="text-sm font-medium mb-1">Additional Notes</p>
                    <p className="text-sm text-muted-foreground">
                      {request.additional_notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Approvals */}
            {request.approval_required && approvals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Approvals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {approvals.map((approval: any) => (
                      <div key={approval.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {approval.status === "approved" ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : approval.status === "rejected" ? (
                            <XCircle className="h-5 w-5 text-red-500" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-500" />
                          )}
                          <div>
                            <p className="text-sm font-medium">{approval.approver?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {approval.approver?.email}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={statusColors[approval.status] || ""}>
                            {approval.status.toUpperCase()}
                          </Badge>
                          {approval.approved_at && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(approval.approved_at), "MMM d, yyyy")}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle>Comments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                  />
                  <Button
                    onClick={() => comment.trim() && addComment.mutate(comment)}
                    disabled={!comment.trim() || addComment.isPending}
                  >
                    {addComment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Comment
                  </Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No comments yet
                    </p>
                  ) : (
                    comments.map((comment: any) => (
                      <div key={comment.id} className="border-l-2 border-primary/20 pl-4 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{comment.user?.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(comment.created_at), "MMM d, yyyy HH:mm")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{comment.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Update Status */}
            <Card>
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  className="w-full"
                  onClick={() => newStatus && updateStatus.mutate(newStatus)}
                  disabled={!newStatus || updateStatus.isPending}
                >
                  {updateStatus.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Status
                </Button>
              </CardContent>
            </Card>

            {/* Request Info */}
            <Card>
              <CardHeader>
                <CardTitle>Request Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Requester</p>
                  <p className="text-sm font-medium">{request.requester?.name}</p>
                  <p className="text-xs text-muted-foreground">{request.requester?.email}</p>
                </div>

                {request.assignee && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Assignee</p>
                    <p className="text-sm font-medium">{request.assignee.name}</p>
                    <p className="text-xs text-muted-foreground">{request.assignee.email}</p>
                  </div>
                )}

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Created</p>
                  <p className="text-sm">
                    {format(new Date(request.created_at), "MMM d, yyyy HH:mm")}
                  </p>
                </div>

                {request.completed_at && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Completed</p>
                    <p className="text-sm">
                      {format(new Date(request.completed_at), "MMM d, yyyy HH:mm")}
                    </p>
                  </div>
                )}

                {request.catalog_item?.estimated_delivery_days && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Estimated Delivery</p>
                    <p className="text-sm">
                      {request.catalog_item.estimated_delivery_days} days
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
