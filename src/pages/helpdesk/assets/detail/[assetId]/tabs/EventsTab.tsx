import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Clock, User } from "lucide-react";

interface EventsTabProps {
  assetId: number;
}

export const EventsTab = ({ assetId }: EventsTabProps) => {
  const { data: events, isLoading } = useQuery({
    queryKey: ["asset-events", assetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("asset_events")
        .select("*")
        .eq("asset_id", assetId)
        .order("performed_at", { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const getEventBadgeVariant = (type: string) => {
    switch (type) {
      case "created": return "default";
      case "assigned": return "secondary";
      case "returned": return "outline";
      case "maintenance": return "destructive";
      default: return "secondary";
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading events...</div>;
  }

  if (!events || events.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No events recorded</div>;
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-2">
          {events.map((event) => (
            <div key={event.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div className="flex items-center gap-3 flex-1">
                <Badge variant={getEventBadgeVariant(event.event_type)} className="text-xs">
                  {event.event_type}
                </Badge>
                <span className="text-sm">{event.event_description}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(event.performed_at), "dd/MM/yyyy HH:mm")}
                </div>
                {event.performed_by && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {event.performed_by}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
