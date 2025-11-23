import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Calendar } from "lucide-react";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  draft: "bg-gray-500",
  submitted: "bg-yellow-500",
  approved: "bg-blue-500",
  scheduled: "bg-purple-500",
  in_progress: "bg-orange-500",
  completed: "bg-green-500",
  failed: "bg-red-500",
  cancelled: "bg-gray-400",
};

export default function ChangeManagementIndex() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: changes, isLoading } = useQuery({
    queryKey: ["change-requests", searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("change_requests")
        .select("*")
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <BackButton />
      <div className="container mx-auto py-4 px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Change Management</h1>
            <p className="text-muted-foreground">Manage infrastructure and system changes</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/helpdesk/service-requests/change-management/calendar")}>
              <Calendar className="h-4 w-4 mr-2" />
              Calendar
            </Button>
            <Button onClick={() => navigate("/helpdesk/service-requests/change-management/create")}>
              <Plus className="h-4 w-4 mr-2" />
              New Change
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search changes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : !changes || changes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No change requests found</p>
              <Button onClick={() => navigate("/helpdesk/service-requests/change-management/create")}>
                Create First Change Request
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {changes.map((change) => (
              <Card
                key={change.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/helpdesk/service-requests/change-management/detail/${change.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{change.change_number}</h3>
                        <Badge className={statusColors[change.status]}>{change.status}</Badge>
                        <Badge variant="outline">{change.risk}</Badge>
                      </div>
                      <p className="font-medium mb-1">{change.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{change.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Impact: </span>
                      <span className="font-medium">{change.impact || "Not specified"}</span>
                    </div>
                    {change.change_calendar_date && (
                      <div>
                        <span className="text-muted-foreground">Scheduled: </span>
                        <span className="font-medium">
                          {format(new Date(change.change_calendar_date), "MMM d, yyyy")}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Created: </span>
                      <span className="font-medium">
                        {format(new Date(change.created_at), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
