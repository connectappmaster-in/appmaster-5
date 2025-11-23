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
import { useAuth } from "@/contexts/AuthContext";

interface ToolInactiveNotice {
  id: string;
  tool_id: string;
  title: string;
  message: string;
  is_active: boolean;
  created_at: string;
  tool_name?: string;
}

interface Tool {
  id: string;
  name: string;
  key: string;
  active: boolean;
}

export function ToolInactiveNoticesManager() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<ToolInactiveNotice | null>(null);
  const [formData, setFormData] = useState({
    tool_id: "",
    title: "",
    message: ""
  });

  const { data: tools = [] } = useQuery({
    queryKey: ["tools"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tools")
        .select("id, name, key, active")
        .order("name");
      if (error) throw error;
      return data as Tool[];
    }
  });

  const { data: notices = [], isLoading } = useQuery({
    queryKey: ["tool-inactive-notices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tool_inactive_notices")
        .select(`
          *,
          tools:tool_id (name)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data.map((notice: any) => ({
        ...notice,
        tool_name: notice.tools?.name
      })) as ToolInactiveNotice[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("tool_inactive_notices")
        .insert([{
          tool_id: data.tool_id,
          title: data.title,
          message: data.message,
          created_by: user?.id
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tool-inactive-notices"] });
      toast.success("Tool inactive notice created successfully");
      resetForm();
    },
    onError: () => {
      toast.error("Failed to create notice");
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("tool_inactive_notices")
        .update({
          tool_id: data.tool_id,
          title: data.title,
          message: data.message
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tool-inactive-notices"] });
      toast.success("Notice updated successfully");
      resetForm();
    },
    onError: () => {
      toast.error("Failed to update notice");
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("tool_inactive_notices")
        .update({ is_active: !isActive })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tool-inactive-notices"] });
      toast.success("Notice status updated");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("tool_inactive_notices")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tool-inactive-notices"] });
      toast.success("Notice deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete notice");
    }
  });

  const resetForm = () => {
    setFormData({
      tool_id: "",
      title: "",
      message: ""
    });
    setEditingNotice(null);
    setDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNotice) {
      updateMutation.mutate({ id: editingNotice.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (notice: ToolInactiveNotice) => {
    setEditingNotice(notice);
    setFormData({
      tool_id: notice.tool_id,
      title: notice.title,
      message: notice.message
    });
    setDialogOpen(true);
  };

  const inactiveTools = tools.filter(t => !t.active);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Tool-Specific Inactive Notices</h3>
          <p className="text-sm text-muted-foreground">
            Customize messages shown to super admins for specific inactive tools
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Notice
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading notices...</div>
      ) : notices.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border rounded-lg">
          No tool-specific notices yet. Create one to customize inactive tool messages.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tool</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notices.map((notice) => (
              <TableRow key={notice.id}>
                <TableCell className="font-medium">{notice.tool_name}</TableCell>
                <TableCell>{notice.title}</TableCell>
                <TableCell>
                  <Badge variant={notice.is_active ? "default" : "secondary"}>
                    {notice.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleActiveMutation.mutate({
                        id: notice.id,
                        isActive: notice.is_active
                      })}
                    >
                      {notice.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(notice)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this notice?")) {
                          deleteMutation.mutate(notice.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingNotice ? "Edit Tool Inactive Notice" : "Create Tool Inactive Notice"}
            </DialogTitle>
            <DialogDescription>
              {editingNotice
                ? "Update the notice details below"
                : "Create a custom notice for an inactive tool"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tool_id">Tool</Label>
              <Select
                value={formData.tool_id}
                onValueChange={(value) => setFormData({ ...formData, tool_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a tool" />
                </SelectTrigger>
                <SelectContent>
                  {inactiveTools.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No inactive tools available
                    </div>
                  ) : (
                    inactiveTools.map((tool) => (
                      <SelectItem key={tool.id} value={tool.id}>
                        {tool.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Only inactive tools are shown in the list
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter notice title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Enter the notice message shown to super admins"
                rows={4}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending || !formData.tool_id}
              >
                {editingNotice ? "Update" : "Create"} Notice
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
