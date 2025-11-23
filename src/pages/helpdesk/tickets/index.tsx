import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Ticket, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
export default function TicketsModule() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("tickets");
  const {
    data: tickets = []
  } = useQuery({
    queryKey: ['helpdesk-tickets'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('helpdesk_tickets').select('*').order('created_at', {
        ascending: false
      }).limit(10);
      if (error) throw error;
      return data || [];
    }
  });
  const {
    data: problems = []
  } = useQuery({
    queryKey: ['helpdesk-problems'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('helpdesk_problems').select('*').order('created_at', {
        ascending: false
      }).limit(10);
      if (error) throw error;
      return data || [];
    }
  });
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-500';
      case 'in_progress':
        return 'bg-yellow-500';
      case 'resolved':
        return 'bg-green-500';
      case 'closed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };
  return <div className="max-w-7xl space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="tickets">
              <Ticket className="h-4 w-4 mr-2" />
              All Tickets
            </TabsTrigger>
            <TabsTrigger value="problems">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Problems
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              New Problem
            </Button>
            <Button onClick={() => navigate('/helpdesk/new')}>
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </div>
        </div>

        <TabsContent value="tickets" className="mt-6 space-y-4">
          {tickets.length === 0 ? <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Ticket className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No tickets found</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/helpdesk/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Ticket
                </Button>
              </CardContent>
            </Card> : tickets.map(ticket => <Card key={ticket.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/helpdesk/tickets/${ticket.id}`)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{ticket.title}</CardTitle>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {ticket.description?.substring(0, 100)}...
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      #{ticket.ticket_number}
                    </span>
                  </div>
                </CardHeader>
              </Card>)}
        </TabsContent>

        <TabsContent value="problems" className="mt-6 space-y-4">
          

          {problems.length === 0 ? <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No problems tracked</p>
              </CardContent>
            </Card> : problems.map(problem => <Card key={problem.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{problem.title}</CardTitle>
                        <Badge className={getStatusColor(problem.status)}>
                          {problem.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {problem.description?.substring(0, 100)}...
                      </p>
                      {problem.root_cause && <p className="text-sm mt-2">
                          <span className="font-medium">Root Cause:</span> {problem.root_cause}
                        </p>}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      #{problem.problem_number}
                    </span>
                  </div>
                </CardHeader>
              </Card>)}
        </TabsContent>
      </Tabs>
    </div>;
}