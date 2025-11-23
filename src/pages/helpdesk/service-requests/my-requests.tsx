import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar, User, AlertCircle } from "lucide-react";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  approved: "bg-blue-500",
  in_progress: "bg-purple-500",
  fulfilled: "bg-green-500",
  rejected: "bg-red-500",
  cancelled: "bg-gray-500",
};

export default function MyRequests() {
  const navigate = useNavigate();

  const { data: requests, isLoading } = useQuery({
    queryKey: ["my-srm-requests"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      const { data, error } = await supabase
        .from("srm_requests")
        .select(`
          *,
          catalog:srm_catalog(name)
        `)
        .eq("requester_id", userData?.id)
        .order("created_at", { ascending: false });

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
            <h1 className="text-3xl font-bold">My Service Requests</h1>
            <p className="text-muted-foreground">View and track your service requests</p>
          </div>
          <Button onClick={() => navigate("/helpdesk/service-requests")}>
            New Request
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : !requests || requests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">You haven't submitted any service requests yet</p>
              <Button onClick={() => navigate("/helpdesk/service-requests")}>
                Browse Services
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card
                key={request.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/helpdesk/service-requests/detail/${request.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{request.request_number}</h3>
                        <Badge className={statusColors[request.status] || "bg-gray-500"}>
                          {request.status}
                        </Badge>
                        <Badge variant="outline">{request.priority}</Badge>
                      </div>
                      <p className="text-muted-foreground">
                        {request.catalog?.name || "Service Request"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Created {format(new Date(request.created_at), "MMM d, yyyy")}</span>
                    </div>
                    {request.assignee_id && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>Assigned</span>
                      </div>
                    )}
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
