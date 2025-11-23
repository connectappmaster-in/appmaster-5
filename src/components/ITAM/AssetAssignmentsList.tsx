import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
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
import { Loader2, Package, UserCheck } from "lucide-react";
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
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active assignments</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Assigned Date</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment: any) => (
              <TableRow key={assignment.id}>
                <TableCell className="font-medium">
                  {assignment.assets?.name || "Unknown"}
                </TableCell>
                <TableCell>
                  {assignment.assets?.asset_type && (
                    <Badge variant="outline">{assignment.assets.asset_type}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{assignment.users?.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {assignment.users?.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(assignment.assigned_at), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {assignment.condition_at_assignment || "N/A"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => returnAsset.mutate(assignment.id)}
                    disabled={returnAsset.isPending}
                  >
                    {returnAsset.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Return
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
