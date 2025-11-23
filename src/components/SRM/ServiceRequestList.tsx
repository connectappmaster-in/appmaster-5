import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ServiceRequestListProps {
  myRequests?: boolean;
}

export const ServiceRequestList = ({ myRequests = false }: ServiceRequestListProps) => {
  const navigate = useNavigate();

  const { data: requests, isLoading, error } = useQuery({
    queryKey: ["srm-requests", myRequests],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      let query = supabase
        .from("srm_requests")
        .select(`
          *,
          requester:users!srm_requests_requester_id_fkey(name, email),
          assignee:users!srm_requests_assignee_id_fkey(name, email),
          catalog_item:srm_catalog(name, category)
        `)
        .order("created_at", { ascending: false });

      if (myRequests && userData) {
        query = query.eq("requester_id", userData.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "approved": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "in_progress": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "completed": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "cancelled": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-lg font-medium mb-2">Failed to load requests</p>
            <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No service requests found</p>
            <p className="text-sm text-muted-foreground">
              {myRequests ? "You haven't made any service requests yet." : "No service requests available."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request: any) => (
        <Card
          key={request.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate(`/srm/request/${request.id}`)}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="outline" className="font-mono">
                    {request.request_number}
                  </Badge>
                  <Badge className={getPriorityColor(request.priority)}>
                    {request.priority}
                  </Badge>
                  <Badge variant="secondary" className={getStatusColor(request.status)}>
                    {request.status.replace("_", " ")}
                  </Badge>
                </div>

                <h3 className="text-lg font-semibold mb-1">
                  {request.catalog_item?.name || "Service Request"}
                </h3>
                {request.catalog_item?.category && (
                  <Badge variant="outline" className="mb-2">{request.catalog_item.category}</Badge>
                )}
                {request.additional_notes && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {request.additional_notes}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    Requester: <span className="text-foreground font-medium">{request.requester?.name || "Unknown"}</span>
                  </span>
                  {request.assignee && (
                    <span>
                      Assigned to: <span className="text-foreground font-medium">{request.assignee.name}</span>
                    </span>
                  )}
                  <span>
                    {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
