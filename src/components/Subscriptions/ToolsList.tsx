import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganisation } from "@/contexts/OrganisationContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, MoreVertical, Edit, Trash2, Calendar } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { AddToolDialog } from "./AddToolDialog";
import { useToast } from "@/hooks/use-toast";
export const ToolsList = () => {
  const {
    organisation
  } = useOrganisation();
  const {
    toast
  } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<any | null>(null);
  const {
    data: tools,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["subscriptions-tools", organisation?.id, searchTerm, statusFilter, categoryFilter],
    queryFn: async () => {
      let query = supabase.from("subscriptions_tools").select("*, subscriptions_vendors(vendor_name)").eq("organisation_id", organisation?.id!);
      if (searchTerm) {
        query = query.ilike("tool_name", `%${searchTerm}%`);
      }
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      if (categoryFilter !== "all") {
        query = query.eq("category", categoryFilter);
      }
      const {
        data,
        error
      } = await query.order("created_at", {
        ascending: false
      });
      if (error) throw error;
      return data;
    },
    enabled: !!organisation?.id
  });
  const handleDelete = async (id: string) => {
    const {
      error
    } = await supabase.from("subscriptions_tools").delete().eq("id", id);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete tool",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Tool deleted successfully"
      });
      refetch();
    }
  };
  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      trial: "secondary",
      expired: "destructive",
      cancelled: "outline"
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };
  const getDaysUntilRenewal = (renewalDate: string | null) => {
    if (!renewalDate) return null;
    const days = Math.ceil((new Date(renewalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search tools..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="SaaS">SaaS</SelectItem>
              <SelectItem value="Desktop Software">Desktop Software</SelectItem>
              <SelectItem value="Cloud Service">Cloud Service</SelectItem>
              <SelectItem value="Security Tool">Security Tool</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Tool
        </Button>
      </div>

      <Card>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tool Name</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Billing</TableHead>
                <TableHead>Renewal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow> : !tools || tools.length === 0 ? <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No tools found. Add your first tool to get started.
                  </TableCell>
                </TableRow> : tools.map(tool => {
              const daysUntilRenewal = getDaysUntilRenewal(tool.renewal_date);
              const isExpiringSoon = daysUntilRenewal !== null && daysUntilRenewal <= 7 && daysUntilRenewal > 0;
              return <TableRow key={tool.id}>
                      <TableCell className="font-medium">{tool.tool_name}</TableCell>
                      <TableCell>{tool.subscriptions_vendors?.vendor_name || "-"}</TableCell>
                      <TableCell>{tool.category || "-"}</TableCell>
                      <TableCell>
                        {tool.currency} {Number(tool.cost).toLocaleString()}
                      </TableCell>
                      <TableCell className="capitalize">
                        {tool.subscription_type?.replace("_", " ")}
                      </TableCell>
                      <TableCell>
                        {tool.renewal_date ? <div className="flex flex-col gap-1">
                            <span className="text-sm">{format(new Date(tool.renewal_date), "MMM dd, yyyy")}</span>
                            {daysUntilRenewal !== null && <Badge variant={isExpiringSoon ? "destructive" : "secondary"} className="text-xs w-fit">
                                {daysUntilRenewal > 0 ? `${daysUntilRenewal}d left` : "Expired"}
                              </Badge>}
                          </div> : "-"}
                      </TableCell>
                      <TableCell>{getStatusBadge(tool.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                        setEditingTool(tool);
                        setIsAddDialogOpen(true);
                      }}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(tool.id)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>;
            })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddToolDialog open={isAddDialogOpen} onOpenChange={open => {
      setIsAddDialogOpen(open);
      if (!open) {
        setEditingTool(null);
      }
    }} onSuccess={() => {
      refetch();
      setEditingTool(null);
    }} editingTool={editingTool} />
    </div>;
};