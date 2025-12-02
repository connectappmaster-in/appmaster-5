import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, User } from "lucide-react";
import { format } from "date-fns";

interface ReserveTabProps {
  assetId: number;
}

export const ReserveTab = ({ assetId }: ReserveTabProps) => {
  const { data: reservations, isLoading } = useQuery({
    queryKey: ["asset-reservations", assetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("asset_reservations")
        .select("*")
        .eq("asset_id", assetId)
        .order("reserved_from", { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "completed": return "secondary";
      case "cancelled": return "outline";
      default: return "secondary";
    }
  };

  if (isLoading) {
    return <div className="text-center py-6 text-sm text-muted-foreground">Loading reservations...</div>;
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <Button variant="outline" size="sm" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            New Reservation
          </Button>

          {(!reservations || reservations.length === 0) ? (
            <div className="text-center py-6 text-sm text-muted-foreground">No reservations</div>
          ) : (
            <div className="space-y-2">
              {reservations.map((reservation) => (
                <div key={reservation.id} className="p-2 border rounded">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">{reservation.reserved_by}</p>
                    </div>
                    <Badge variant={getStatusVariant(reservation.status || 'active')} className="text-xs">
                      {reservation.status || 'active'}
                    </Badge>
                  </div>
                  <div className="ml-6">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(reservation.reserved_from), "dd/MM/yyyy")}
                      {" - "}
                      {format(new Date(reservation.reserved_to), "dd/MM/yyyy")}
                    </div>
                    {reservation.purpose && (
                      <p className="text-xs text-muted-foreground mt-1">{reservation.purpose}</p>
                    )}
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
