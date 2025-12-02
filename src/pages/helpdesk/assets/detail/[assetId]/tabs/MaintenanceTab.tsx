import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wrench, Plus, Calendar } from "lucide-react";
import { format } from "date-fns";

interface MaintenanceTabProps {
  assetId: number;
}

export const MaintenanceTab = ({ assetId }: MaintenanceTabProps) => {
  const { data: maintenanceRecords, isLoading } = useQuery({
    queryKey: ["asset-maintenance", assetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("asset_maintenance")
        .select("*")
        .eq("asset_id", assetId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "in_progress": return "secondary";
      case "pending": return "outline";
      default: return "secondary";
    }
  };

  if (isLoading) {
    return <div className="text-center py-6 text-sm text-muted-foreground">Loading maintenance records...</div>;
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <Button variant="outline" size="sm" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Maintenance Record
          </Button>

          {(!maintenanceRecords || maintenanceRecords.length === 0) ? (
            <div className="text-center py-6 text-sm text-muted-foreground">No maintenance records</div>
          ) : (
            <div className="space-y-2">
              {maintenanceRecords.map((record) => (
                <div key={record.id} className="p-2 border rounded">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">{record.issue_description}</p>
                    </div>
                    <Badge variant={getStatusVariant(record.status || 'pending')} className="text-xs">
                      {record.status || 'pending'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground ml-6">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(record.created_at), "dd/MM/yyyy")}
                    </div>
                    {record.cost && <span>Cost: ₹{record.cost.toLocaleString()}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
