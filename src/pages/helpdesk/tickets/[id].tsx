import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Clock, User, Tag, MessageSquare, ArrowLeft, Edit, UserPlus, FileText, History, Paperclip, Link } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import { EditTicketDialog } from "@/components/helpdesk/EditTicketDialog";
import { AssignTicketDialog } from "@/components/helpdesk/AssignTicketDialog";

export default function TicketDetail() {
  const { id: ticketId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [editDialog, setEditDialog] = useState(false);
  const [assignDialog, setAssignDialog] = useState(false);

  const { data: ticket, isLoading } = useQuery({
    queryKey: ["helpdesk-ticket", ticketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("helpdesk_tickets")
        .select(`
          *,
          requester:users!helpdesk_tickets_requester_id_fkey(name, email),
          assignee:users!helpdesk_tickets_assignee_id_fkey(name, email),
          category:helpdesk_categories(name)
        `)
        .eq("id", parseInt(ticketId!))
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!ticketId,
  });

  const { data: comments } = useQuery({
    queryKey: ["helpdesk-ticket-comments", ticketId],
    queryFn: async () => {
      const { data } = await supabase
        .from("helpdesk_ticket_comments")
        .select("*, user:users(name, email)")
        .eq("ticket_id", parseInt(ticketId!))
        .order("created_at", { ascending: true });
      return data || [];
    },
    enabled: !!ticketId,
  });

  const { data: history } = useQuery({
    queryKey: ["helpdesk-ticket-history", ticketId],
    queryFn: async () => {
      const { data } = await supabase
        .from("helpdesk_ticket_history")
        .select("*, user:users(name, email)")
        .eq("ticket_id", parseInt(ticketId!))
        .order("timestamp", { ascending: false });
      return data || [];
    },
    enabled: !!ticketId,
  });

  const { data: attachments } = useQuery({
    queryKey: ["helpdesk-ticket-attachments", ticketId],
    queryFn: async () => {
      const { data } = await supabase
        .from("helpdesk_ticket_attachments")
        .select("*, uploaded_by_user:users!helpdesk_ticket_attachments_uploaded_by_fkey(name, email)")
        .eq("ticket_id", parseInt(ticketId!))
        .order("uploaded_at", { ascending: false });
      return data || [];
    },
    enabled: !!ticketId,
  });

  const { data: linkedProblems } = useQuery({
    queryKey: ["helpdesk-problem-tickets", ticketId],
    queryFn: async () => {
      const { data } = await supabase
        .from("helpdesk_problem_tickets")
        .select("*, problem:helpdesk_problems(id, problem_number, problem_title, status)")
        .eq("ticket_id", parseInt(ticketId!));
      return data || [];
    },
    enabled: !!ticketId,
  });

  const { data: currentUser } = useQuery({
    queryKey: ["current-user-id"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("users")
        .select("id, organisation_id")
        .eq("auth_user_id", user.id)
        .single();

      return data;
    },
  });

  const addComment = useMutation({
    mutationFn: async (commentText: string) => {
      if (!currentUser || !ticket) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", currentUser.id)
        .maybeSingle();

      const { error } = await supabase.from("helpdesk_ticket_comments").insert({
        ticket_id: parseInt(ticketId!),
        user_id: currentUser.id,
        comment: commentText,
        tenant_id: profileData?.tenant_id || ticket.tenant_id,
        is_internal: false,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Comment added");
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["helpdesk-ticket-comments", ticketId] });
    },
    onError: (error: Error) => {
      toast.error("Failed to add comment: " + error.message);
    },
  });

  const updateStatus = useMutation({
    mutationFn: async (status: string) => {
      const updates: any = { status };
      if (status === "resolved") {
        updates.resolved_at = new Date().toISOString();
      } else if (status === "closed") {
        updates.closed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("helpdesk_tickets")
        .update(updates)
        .eq("id", parseInt(ticketId!));

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["helpdesk-ticket", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["helpdesk-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["helpdesk-dashboard-stats"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to update status: " + error.message);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Ticket not found</p>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/helpdesk/tickets")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tickets
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setAssignDialog(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Assign
            </Button>
            <Button
              variant="outline"
              onClick={() => setEditDialog(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Badge variant="outline" className="font-mono text-lg px-3 py-1">
              {ticket.ticket_number}
            </Badge>
            <Badge className={`${getPriorityColor(ticket.priority)} text-white`}>
              {ticket.priority}
            </Badge>
            {ticket.category && (
              <Badge variant="outline">{ticket.category.name}</Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold mb-2">{ticket.title}</h1>
          <p className="text-muted-foreground">
            Created {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="details">
                  <FileText className="h-4 w-4 mr-2" />
                  Details
                </TabsTrigger>
                <TabsTrigger value="comments">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Comments ({comments?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="history">
                  <History className="h-4 w-4 mr-2" />
                  History
                </TabsTrigger>
                <TabsTrigger value="attachments">
                  <Paperclip className="h-4 w-4 mr-2" />
                  Attachments ({attachments?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="problems">
                  <Link className="h-4 w-4 mr-2" />
                  Problems ({linkedProblems?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{ticket.description}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comments" className="mt-6">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    {comments && comments.length > 0 ? (
                      comments.map((c: any) => (
                        <div key={c.id} className="border-b pb-4 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{c.user?.name || "Unknown"}</span>
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{c.comment}</p>
                          {c.is_internal && (
                            <Badge variant="secondary" className="mt-2">Internal</Badge>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No comments yet</p>
                    )}

                    <div className="pt-4 space-y-3">
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
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    {history && history.length > 0 ? (
                      history.map((h: any) => (
                        <div key={h.id} className="border-b pb-4 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{h.user?.name || "System"}</span>
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(h.timestamp), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm">
                            <span className="font-medium">{h.field_name}:</span>{" "}
                            <span className="text-muted-foreground">{h.old_value || "—"}</span>
                            {" → "}
                            <span>{h.new_value || "—"}</span>
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No history yet</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="attachments" className="mt-6">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    {attachments && attachments.length > 0 ? (
                      attachments.map((a: any) => (
                        <div key={a.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                          <div className="flex items-center gap-3">
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{a.file_name}</p>
                              <p className="text-sm text-muted-foreground">
                                Uploaded by {a.uploaded_by_user?.name || "Unknown"} •{" "}
                                {formatDistanceToNow(new Date(a.uploaded_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={a.file_url} target="_blank" rel="noopener noreferrer">
                              Download
                            </a>
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No attachments</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="problems" className="mt-6">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    {linkedProblems && linkedProblems.length > 0 ? (
                      linkedProblems.map((lp: any) => (
                        <div key={lp.id} className="border-b pb-4 last:border-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{lp.problem?.problem_number}</p>
                              <p className="text-sm">{lp.problem?.problem_title}</p>
                            </div>
                            <Badge>{lp.problem?.status}</Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No linked problems</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select
                  value={newStatus || ticket.status}
                  onValueChange={setNewStatus}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                {newStatus && newStatus !== ticket.status && (
                  <Button
                    onClick={() => updateStatus.mutate(newStatus)}
                    disabled={updateStatus.isPending}
                    className="w-full"
                  >
                    Update Status
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Requester</p>
                    <p className="font-medium">{ticket.requester?.name || "Unknown"}</p>
                  </div>
                </div>

                {ticket.assignee && (
                  <div className="flex items-start gap-2">
                    <Tag className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Assigned to</p>
                      <p className="font-medium">{ticket.assignee.name}</p>
                    </div>
                  </div>
                )}

                {ticket.sla_due_date && (
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">SLA Due</p>
                      <p className="font-medium">
                        {formatDistanceToNow(new Date(ticket.sla_due_date), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <EditTicketDialog
        open={editDialog}
        onOpenChange={setEditDialog}
        ticket={ticket}
      />

      <AssignTicketDialog
        open={assignDialog}
        onOpenChange={setAssignDialog}
        ticket={ticket}
      />
    </div>
  );
}
