import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Loader2, Clock, User, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  approved: "bg-blue-500",
  in_progress: "bg-purple-500",
  fulfilled: "bg-green-500",
  rejected: "bg-red-500",
};

export default function RequestDetail() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");

  const { data: request, isLoading } = useQuery({
    queryKey: ["srm-request", requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("srm_requests")
        .select(`
          *,
          catalog:srm_catalog(name, description)
        `)
        .eq("id", parseInt(requestId || "0"))
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!requestId,
  });

  const { data: comments } = useQuery({
    queryKey: ["srm-request-comments", requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("srm_request_comments")
        .select(`
          *,
          user:users(name, email)
        `)
        .eq("request_id", parseInt(requestId || "0"))
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!requestId,
  });

  const { data: approvals } = useQuery({
    queryKey: ["srm-request-approvals", requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("srm_request_approvals")
        .select("*")
        .eq("request_id", parseInt(requestId || "0"))
        .order("step_number", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!requestId,
  });

  const addComment = useMutation({
    mutationFn: async (commentText: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      const { error } = await supabase
        .from("srm_request_comments")
        .insert({
          request_id: parseInt(requestId || "0"),
          user_id: userData?.id,
          comment: commentText,
          tenant_id: 1,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["srm-request-comments", requestId] });
      setComment("");
      toast.success("Comment added");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-background">
        <BackButton />
        <div className="container mx-auto py-8 px-4 text-center">
          <p className="text-muted-foreground">Request not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <BackButton />
      <div className="container mx-auto py-4 px-4 max-w-7xl">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{request.request_number}</h1>
            <Badge className={statusColors[request.status]}>{request.status}</Badge>
            <Badge variant="outline">{request.priority}</Badge>
          </div>
          <p className="text-muted-foreground">{request.catalog?.name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="details" className="w-full">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="approvals">Approvals</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Request Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                  <div>
                    <p className="text-muted-foreground">Form Data</p>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96">
                      {request.description}
                    </pre>
                  </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="approvals" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Approval Workflow</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!approvals || approvals.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No approvals required</p>
                    ) : (
                      <div className="space-y-4">
                        {approvals.map((approval) => (
                          <div key={approval.id} className="flex items-start gap-4 p-4 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="font-semibold">Step {approval.step_number}</p>
                                <Badge variant={approval.status === "approved" ? "default" : "secondary"}>
                                  {approval.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Approver ID: {approval.approver_id}
                              </p>
                              {approval.comments && (
                                <p className="text-sm mt-2">{approval.comments}</p>
                              )}
                            </div>
                            {approval.status === "approved" && (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comments" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Comments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 mb-6">
                        {comments?.map((c) => (
                        <div key={c.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-sm">{c.user_id}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(c.created_at), "MMM d, yyyy HH:mm")}
                            </p>
                          </div>
                          <p className="text-sm">{c.comment}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label>Add Comment</Label>
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write a comment..."
                        rows={3}
                      />
                      <Button
                        onClick={() => addComment.mutate(comment)}
                        disabled={!comment.trim() || addComment.isPending}
                      >
                        {addComment.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Add Comment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Request Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Requester</p>
                    <p className="font-medium">{request.requester_id}</p>
                  </div>
                </div>
                {request.assignee_id && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Assigned To</p>
                      <p className="font-medium">{request.assignee_id}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-medium">
                      {format(new Date(request.created_at), "MMM d, yyyy HH:mm")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
