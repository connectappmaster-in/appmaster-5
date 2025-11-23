import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Archive, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

export default function ClosedArchive() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: closedTickets, isLoading } = useQuery({
    queryKey: ["closed-tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("helpdesk_tickets")
        .select(`
          *,
          category:helpdesk_categories(name),
          requester:users!helpdesk_tickets_requester_id_fkey(name),
          assignee:users!helpdesk_tickets_assignee_id_fkey(name)
        `)
        .in("status", ["resolved", "closed"])
        .order("closed_at", { ascending: false, nullsFirst: false })
        .order("resolved_at", { ascending: false, nullsFirst: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredTickets = closedTickets?.filter((ticket) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      ticket.ticket_number?.toLowerCase().includes(query) ||
      ticket.title?.toLowerCase().includes(query) ||
      ticket.description?.toLowerCase().includes(query)
    );
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <BackButton />
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/helpdesk/tickets")}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tickets
          </Button>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Archive className="h-8 w-8" />
            Closed Tickets Archive
          </h1>
          <p className="text-muted-foreground mt-2">
            View all resolved and closed tickets
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Archive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ticket number, title, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </CardContent>
          </Card>
        ) : filteredTickets && filteredTickets.length > 0 ? (
          <div className="space-y-3">
            {filteredTickets.map((ticket) => (
              <Card
                key={ticket.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/helpdesk/tickets/${ticket.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant="outline" className="font-mono">
                          {ticket.ticket_number}
                        </Badge>
                        <Badge className="bg-gray-500">
                          {ticket.status}
                        </Badge>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                        {ticket.category && (
                          <Badge variant="outline">{ticket.category.name}</Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold mb-1">{ticket.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {ticket.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          Created {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                        </span>
                        {ticket.closed_at && (
                          <span>
                            Closed {formatDistanceToNow(new Date(ticket.closed_at), { addSuffix: true })}
                          </span>
                        )}
                        {ticket.resolved_at && !ticket.closed_at && (
                          <span>
                            Resolved {formatDistanceToNow(new Date(ticket.resolved_at), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      {ticket.assignee && (
                        <div className="mt-2 text-sm">
                          <span className="text-muted-foreground">Assigned to: </span>
                          <span className="font-medium">{ticket.assignee.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Archive className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "No tickets found matching your search" : "No closed tickets in archive"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
