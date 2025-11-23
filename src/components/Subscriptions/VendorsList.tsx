import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganisation } from "@/contexts/OrganisationContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, MoreVertical, Edit, Trash2, Mail, Phone, Globe } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { AddVendorDialog } from "./AddVendorDialog";

export const VendorsList = () => {
  const { organisation } = useOrganisation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: vendors, isLoading, refetch } = useQuery({
    queryKey: ["subscriptions-vendors", organisation?.id, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("subscriptions_vendors")
        .select("*, subscriptions_tools(count)")
        .eq("organisation_id", organisation?.id!);

      if (searchTerm) {
        query = query.ilike("vendor_name", `%${searchTerm}%`);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!organisation?.id,
  });

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("subscriptions_vendors")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete vendor",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Vendor deleted successfully",
      });
      refetch();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Vendor
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : !vendors || vendors.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No vendors found. Add your first vendor to get started.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Vendor
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vendors.map((vendor) => (
            <Card key={vendor.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{vendor.vendor_name}</CardTitle>
                    <CardDescription>
                      {(vendor.subscriptions_tools as any)?.[0]?.count || 0} tools
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(vendor.id)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {vendor.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{vendor.email}</span>
                  </div>
                )}
                {vendor.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{vendor.phone}</span>
                  </div>
                )}
                {vendor.website && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="w-4 h-4" />
                    <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                      {vendor.website}
                    </a>
                  </div>
                )}
                {vendor.notes && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                    {vendor.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddVendorDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onSuccess={refetch} />
    </div>
  );
};
