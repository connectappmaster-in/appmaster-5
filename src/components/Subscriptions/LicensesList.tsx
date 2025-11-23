import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganisation } from "@/contexts/OrganisationContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, MoreVertical, Edit, Trash2, Key } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { AddLicenseDialog } from "./AddLicenseDialog";
import { useToast } from "@/hooks/use-toast";

export const LicensesList = () => {
  const { organisation } = useOrganisation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<any>(null);

  const { data: licenses, isLoading, refetch } = useQuery({
    queryKey: ["subscriptions-licenses", organisation?.id, searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("subscriptions_licenses")
        .select(`
          *,
          subscriptions_tools(tool_name),
          users(name, email)
        `)
        .eq("organisation_id", organisation?.id!);

      if (searchTerm) {
        query = query.or(`license_key.ilike.%${searchTerm}%,subscriptions_tools.tool_name.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!organisation?.id,
  });

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("subscriptions_licenses")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete license",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "License deleted successfully",
      });
      refetch();
    }
  };

  const handleEdit = (license: any) => {
    setEditingLicense(license);
    setIsAddDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setEditingLicense(null);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      available: "secondary",
      assigned: "default",
      expired: "destructive",
      revoked: "outline",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getDaysUntilExpiry = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    const days = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <p className="text-center text-muted-foreground">Loading licenses...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search licenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="revoked">Revoked</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add License
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>License Management</CardTitle>
          <CardDescription>
            Track and manage software licenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!licenses || licenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No licenses found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tool</TableHead>
                    <TableHead>License Key</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Device ID</TableHead>
                    <TableHead>Assigned Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {licenses.map((license) => {
                    const daysUntilExpiry = getDaysUntilExpiry(license.expiry_date);
                    return (
                      <TableRow key={license.id}>
                        <TableCell className="font-medium">
                          {license.subscriptions_tools?.tool_name || "N/A"}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {license.license_key || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {getStatusBadge(license.status || "available")}
                            {daysUntilExpiry !== null && daysUntilExpiry <= 30 && (
                              <span className="text-xs text-orange-600">
                                {daysUntilExpiry > 0 ? `${daysUntilExpiry}d left` : "Expired"}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {license.users?.name || license.users?.email || "-"}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {license.assigned_to_device_id || "-"}
                        </TableCell>
                        <TableCell>
                          {license.assigned_date
                            ? format(new Date(license.assigned_date), "MMM dd, yyyy")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {license.expiry_date
                            ? format(new Date(license.expiry_date), "MMM dd, yyyy")
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(license)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(license.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddLicenseDialog
        open={isAddDialogOpen}
        onOpenChange={handleDialogClose}
        onSuccess={() => {
          refetch();
          handleDialogClose();
        }}
        editingLicense={editingLicense}
      />
    </div>
  );
};
