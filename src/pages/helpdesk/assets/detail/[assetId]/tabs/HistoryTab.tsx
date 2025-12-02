import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Clock, Package, Wrench, FileText, User } from "lucide-react";

interface HistoryTabProps {
  assetId: number;
}

export const HistoryTab = ({ assetId }: HistoryTabProps) => {
  const { data: history, isLoading } = useQuery({
    queryKey: ["asset-history", assetId],
    queryFn: async () => {
      // Fetch all history from different sources
      const [events, assignments, maintenance, depreciation] = await Promise.all([
        supabase.from("asset_events").select("*").eq("asset_id", assetId),
        supabase.from("asset_assignments").select("*").eq("asset_id", assetId),
        supabase.from("asset_maintenance").select("*").eq("asset_id", assetId),
        supabase.from("depreciation_entries").select("*").eq("asset_id", assetId)
      ]);

      // Combine and sort all entries
      const combined = [
        ...(events.data || []).map(e => ({ ...e, type: 'event', date: e.performed_at })),
        ...(assignments.data || []).map(a => ({ ...a, type: 'assignment', date: a.assigned_at })),
        ...(maintenance.data || []).map(m => ({ ...m, type: 'maintenance', date: m.created_at })),
        ...(depreciation.data || []).map(d => ({ ...d, type: 'depreciation', date: d.created_at }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return combined;
    }
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'event': return <Package className="h-5 w-5" />;
      case 'assignment': return <User className="h-5 w-5" />;
      case 'maintenance': return <Wrench className="h-5 w-5" />;
      case 'depreciation': return <FileText className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const getTitle = (item: any) => {
    switch (item.type) {
      case 'event': return item.event_description || item.event_type;
      case 'assignment': return item.returned_at ? 'Asset returned' : 'Asset assigned';
      case 'maintenance': return `Maintenance: ${item.issue_description}`;
      case 'depreciation': return `Depreciation entry: ₹${item.depreciation_amount}`;
      default: return 'Activity';
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading history...</div>;
  }

  if (!history || history.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No history available</div>;
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-2">
          {history.map((item, index) => (
            <div key={`${item.type}-${item.id}-${index}`} className="flex gap-3 py-2 border-b last:border-0">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{getTitle(item)}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Clock className="h-3 w-3" />
                  {format(new Date(item.date), "dd/MM/yyyy HH:mm")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
