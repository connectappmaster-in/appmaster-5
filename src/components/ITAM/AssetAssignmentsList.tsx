import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export const AssetAssignmentsList = () => {
  const queryClient = useQueryClient();

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["asset-assignments"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: userData } = await supabase
        .from("users")
        .select("organisation_id")
        .eq("auth_user_id", user.id)
        .single();

      const { data: profileData } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", user.id)
        .maybeSingle();

      const tenantId = profileData?.tenant_id || 1;
      const orgId = userData?.organisation_id;

      let query = supabase
        .from("asset_assignments")
        .select(`
          *,
          assets:asset_id (name, asset_type),
          users:assigned_to (name, email)
        `)
        .is("returned_at", null)
        .order("assigned_at", { ascending: false });

      if (orgId) {
        query = query.eq("organisation_id", orgId);
      } else {
        query = query.eq("tenant_id", tenantId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const returnAsset = useMutation({
    mutationFn: async (assignmentId: number) => {
      const { error } = await supabase
        .from("asset_assignments")
        .update({ returned_at: new Date().toISOString() })
        .eq("id", assignmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Asset returned successfully");
      queryClient.invalidateQueries({ queryKey: ["asset-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["itam-stats"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to return asset: " + error.message);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-lg">
        <div className="rounded-full bg-muted p-4 mb-3">
          <UserCheck className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold mb-1">No active assignments</h3>
        <p className="text-xs text-muted-foreground text-center max-w-md">
          Assets will appear here once they are assigned to users
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-xs font-medium h-9">ASSET</TableHead>
            <TableHead className="text-xs font-medium h-9">TYPE</TableHead>
            <TableHead className="text-xs font-medium h-9">ASSIGNED TO</TableHead>
            <TableHead className="text-xs font-medium h-9">ASSIGNED DATE</TableHead>
            <TableHead className="text-xs font-medium h-9">CONDITION</TableHead>
            <TableHead className="text-xs font-medium h-9 text-right">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.map((assignment: any) => (
            <TableRow key={assignment.id} className="hover:bg-muted/50">
              <TableCell className="font-medium text-sm py-2">
                {assignment.assets?.name || "Unknown"}
              </TableCell>
              <TableCell className="py-2">
                {assignment.assets?.asset_type && (
                  <Badge variant="outline" className="text-xs capitalize">
                    {assignment.assets.asset_type}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="py-2">
                <div>
                  <div className="font-medium text-sm">{assignment.users?.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {assignment.users?.email}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground py-2">
                {format(new Date(assignment.assigned_at), "MMM d, yyyy")}
              </TableCell>
              <TableCell className="py-2">
                <Badge variant="secondary" className="text-xs capitalize">
                  {assignment.condition_at_assignment || "N/A"}
                </Badge>
              </TableCell>
              <TableCell className="text-right py-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7"
                  onClick={() => returnAsset.mutate(assignment.id)}
                  disabled={returnAsset.isPending}
                >
                  {returnAsset.isPending && (
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  )}
                  Return
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
