import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Power, PowerOff } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ToolInactiveNoticesManager } from "@/components/SuperAdmin/ToolInactiveNoticesManager";
import { Separator } from "@/components/ui/separator";
interface Broadcast {
  id: string;
  title: string;
  description: string;
  target_audience: string;
  is_active: boolean;
  scheduled_for: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}
export default function BroadcastsPage() {
  const {
    user
  } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBroadcast, setEditingBroadcast] = useState<Broadcast | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target_audience: "all_users",
    scheduled_for: "",
    expires_at: ""
  });
  const {
    data: broadcasts = [],
    isLoading
  } = useQuery({
    queryKey: ["broadcasts"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("broadcasts").select("*").order("created_at", {
        ascending: false
      });
      if (error) throw error;
      return data as Broadcast[];
    }
  });
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const {
        error
      } = await supabase.from("broadcasts").insert([{
        title: data.title,
        description: data.description,
        target_audience: data.target_audience as "all_users" | "individual_users" | "organization_admins" | "organization_users",
        scheduled_for: data.scheduled_for || null,
        expires_at: data.expires_at || null,
        created_by: user?.id || ''
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["broadcasts"]
      });
      toast.success("Broadcast created successfully");
      resetForm();
    },
    onError: () => {
      toast.error("Failed to create broadcast");
    }
  });
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data
    }: {
      id: string;
      data: typeof formData;
    }) => {
      const {
        error
      } = await supabase.from("broadcasts").update({
        title: data.title,
        description: data.description,
        target_audience: data.target_audience as "all_users" | "individual_users" | "organization_admins" | "organization_users",
        scheduled_for: data.scheduled_for || null,
        expires_at: data.expires_at || null
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["broadcasts"]
      });
      toast.success("Broadcast updated successfully");
      resetForm();
    },
    onError: () => {
      toast.error("Failed to update broadcast");
    }
  });
  const toggleActiveMutation = useMutation({
    mutationFn: async ({
      id,
      isActive
    }: {
      id: string;
      isActive: boolean;
    }) => {
      const {
        error
      } = await supabase.from("broadcasts").update({
        is_active: !isActive
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["broadcasts"]
      });
      toast.success("Broadcast status updated");
    }
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const {
        error
      } = await supabase.from("broadcasts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["broadcasts"]
      });
      toast.success("Broadcast deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete broadcast");
    }
  });
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      target_audience: "all_users",
      scheduled_for: "",
      expires_at: ""
    });
    setEditingBroadcast(null);
    setDialogOpen(false);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBroadcast) {
      updateMutation.mutate({
        id: editingBroadcast.id,
        data: formData
      });
    } else {
      createMutation.mutate(formData);
    }
  };
  const handleEdit = (broadcast: Broadcast) => {
    setEditingBroadcast(broadcast);
    setFormData({
      title: broadcast.title,
      description: broadcast.description,
      target_audience: broadcast.target_audience,
      scheduled_for: broadcast.scheduled_for || "",
      expires_at: broadcast.expires_at || ""
    });
    setDialogOpen(true);
  };
  const getAudienceLabel = (audience: string) => {
    const labels: Record<string, string> = {
      individual_users: "Individual Users",
      organization_admins: "Organization Admins",
      organization_users: "All Organization Users",
      all_users: "All Users (System-wide)"
    };
    return labels[audience] || audience;
  };
  return <div className="p-6 space-y-6">
      {/* Tool-Specific Inactive Notices Section */}
      <Card>
        <CardContent className="pt-6">
          <ToolInactiveNoticesManager />
        </CardContent>
      </Card>

      <Separator />

      {/* General Broadcast Messages Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Broadcast Management</CardTitle>
              <CardDescription>
                Create and manage system-wide broadcasts. 
                <span className="block mt-2 text-xs bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded px-2 py-1 inline-block">
                  💡 Tip: Create a broadcast with "Tool Inactive" in the title to customize the notice shown to super admins when viewing inactive tools.
                </span>
              </CardDescription>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Broadcast
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="text-center py-8 text-muted-foreground">Loading broadcasts...</div> : broadcasts.length === 0 ? <div className="text-center py-8 text-muted-foreground">
              No broadcasts yet. Create your first broadcast to get started.
            </div> : <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Target Audience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {broadcasts.map(broadcast => <TableRow key={broadcast.id}>
                    <TableCell className="font-medium">{broadcast.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getAudienceLabel(broadcast.target_audience)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={broadcast.is_active ? "default" : "secondary"}>
                        {broadcast.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {broadcast.scheduled_for ? format(new Date(broadcast.scheduled_for), "MMM d, yyyy") : "Immediate"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(broadcast.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => toggleActiveMutation.mutate({
                    id: broadcast.id,
                    isActive: broadcast.is_active
                  })}>
                          {broadcast.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(broadcast)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                    if (confirm("Are you sure you want to delete this broadcast?")) {
                      deleteMutation.mutate(broadcast.id);
                    }
                  }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>)}
              </TableBody>
            </Table>}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingBroadcast ? "Edit Broadcast" : "Create New Broadcast"}</DialogTitle>
            <DialogDescription>
              {editingBroadcast ? "Update the broadcast details below" : "Create a new broadcast message to send to targeted users"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={formData.title} onChange={e => setFormData({
              ...formData,
              title: e.target.value
            })} placeholder="Enter broadcast title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea id="description" value={formData.description} onChange={e => setFormData({
              ...formData,
              description: e.target.value
            })} placeholder="Enter broadcast message" rows={4} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_audience">Target Audience</Label>
              <Select value={formData.target_audience} onValueChange={value => setFormData({
              ...formData,
              target_audience: value
            })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual_users">Individual Users Only</SelectItem>
                  <SelectItem value="organization_admins">Organization Admins Only</SelectItem>
                  <SelectItem value="organization_users">All Organization Users</SelectItem>
                  <SelectItem value="all_users">All Users (System-wide)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduled_for">Schedule For (Optional)</Label>
                <Input id="scheduled_for" type="datetime-local" value={formData.scheduled_for} onChange={e => setFormData({
                ...formData,
                scheduled_for: e.target.value
              })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expires_at">Expires At (Optional)</Label>
                <Input id="expires_at" type="datetime-local" value={formData.expires_at} onChange={e => setFormData({
                ...formData,
                expires_at: e.target.value
              })} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingBroadcast ? "Update" : "Create"} Broadcast
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>;
}