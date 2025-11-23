import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Plus, 
  Ticket, 
  AlertTriangle, 
  LayoutGrid, 
  Table as TableIcon, 
  Archive, 
  Link as LinkIcon, 
  BookOpen, 
  Clock,
  Settings,
  BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreateProblemDialog } from "@/components/helpdesk/CreateProblemDialog";
import { TicketStatsCards } from "@/components/helpdesk/TicketStatsCards";
import { TicketFilters } from "@/components/helpdesk/TicketFilters";
import { BulkActionsToolbar } from "@/components/helpdesk/BulkActionsToolbar";
import { TicketTableView } from "@/components/helpdesk/TicketTableView";
import { Badge } from "@/components/ui/badge";

export default function TicketsModule() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("tickets");
  const [createProblemOpen, setCreateProblemOpen] = useState(false);
  const [view, setView] = useState<'list' | 'table'>('list');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [filters, setFilters] = useState<Record<string, any>>({});

  const { data: allTickets, isLoading } = useQuery({
    queryKey: ['helpdesk-tickets-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('helpdesk_tickets')
        .select('*, category:helpdesk_categories(name), assignee:helpdesk_tickets_assignee_id_fkey(full_name)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Client-side filtering
  const tickets = (allTickets || []).filter((ticket: any) => {
    if (filters.status && ticket.status !== filters.status) return false;
    if (filters.priority && ticket.priority !== filters.priority) return false;
    if (filters.category && ticket.category_id?.toString() !== filters.category) return false;
    if (filters.assignee === 'unassigned' && ticket.assignee_id) return false;
    if (filters.assignee && filters.assignee !== 'unassigned' && ticket.assignee_id !== filters.assignee) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      const matchesSearch = 
        ticket.title?.toLowerCase().includes(search) ||
        ticket.description?.toLowerCase().includes(search) ||
        ticket.ticket_number?.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }
    if (filters.dateFrom && new Date(ticket.created_at) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(ticket.created_at) > new Date(filters.dateTo)) return false;
    return true;
  });

  const { data: allProblems } = useQuery({
    queryKey: ['helpdesk-problems'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('helpdesk_problems')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const problems = allProblems || [];

  const handleSelectTicket = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? tickets.map((t: any) => t.id) : []);
  };

  const quickLinks = [
    { icon: Archive, label: "Closed Archive", path: "/helpdesk/tickets/closed-archive" },
    { icon: LinkIcon, label: "Linked Problems", path: "/helpdesk/tickets/linked-problems" },
    { icon: BookOpen, label: "Knowledge Base", path: "/helpdesk/kb" },
    { icon: Clock, label: "SLA Policies", path: "/helpdesk/sla" },
    { icon: Settings, label: "Assignment Rules", path: "/helpdesk/tickets/assignment-rules" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">Tickets & Problems</h1>
              <p className="text-lg text-muted-foreground">Manage support tickets and track recurring issues</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/helpdesk/tickets/reports')} className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Reports
              </Button>
              <Button onClick={() => navigate('/helpdesk/new')} className="gap-2">
                <Plus className="h-4 w-4" />
                New Ticket
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Button 
                  key={link.path}
                  variant="outline" 
                  onClick={() => navigate(link.path)} 
                  className="justify-start gap-2 h-auto py-3"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{link.label}</span>
                </Button>
              );
            })}
          </div>

          {/* Stats Cards */}
          <TicketStatsCards />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tabs Header with Actions */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <TabsList className="h-11">
              <TabsTrigger value="tickets" className="gap-2 px-6">
                <Ticket className="h-4 w-4" />
                All Tickets
                {tickets.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {tickets.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="problems" className="gap-2 px-6">
                <AlertTriangle className="h-4 w-4" />
                Problems
                {problems.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {problems.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-3">
              {activeTab === 'tickets' && (
                <div className="flex gap-2">
                  <Button
                    variant={view === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setView('list')}
                    className="gap-2"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    List
                  </Button>
                  <Button
                    variant={view === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setView('table')}
                    className="gap-2"
                  >
                    <TableIcon className="h-4 w-4" />
                    Table
                  </Button>
                </div>
              )}
              <Button 
                variant="outline" 
                onClick={() => setCreateProblemOpen(true)} 
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                New Problem
              </Button>
            </div>
          </div>

          <TabsContent value="tickets" className="space-y-6">
            {/* Filters */}
            <TicketFilters onFilterChange={setFilters} activeFilters={filters} />

            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
              <BulkActionsToolbar
                selectedIds={selectedIds}
                onClearSelection={() => setSelectedIds([])}
              />
            )}

            {/* Tickets Content */}
            {isLoading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-20">
                  <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground">Loading tickets...</p>
                  </div>
                </CardContent>
              </Card>
            ) : tickets.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-20">
                  <div className="rounded-full bg-muted p-6 mb-4">
                    <Ticket className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No tickets found</h3>
                  <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
                    {Object.keys(filters).length > 0 
                      ? "Try adjusting your filters to see more tickets" 
                      : "Get started by creating your first support ticket"}
                  </p>
                  {Object.keys(filters).length === 0 && (
                    <Button onClick={() => navigate('/helpdesk/new')} size="lg" className="gap-2">
                      <Plus className="h-5 w-5" />
                      Create First Ticket
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : view === 'table' ? (
              <TicketTableView
                tickets={tickets}
                selectedIds={selectedIds}
                onSelectTicket={handleSelectTicket}
                onSelectAll={handleSelectAll}
              />
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket: any) => (
                  <Card 
                    key={ticket.id} 
                    className={`hover:shadow-md transition-shadow cursor-pointer ${
                      selectedIds.includes(ticket.id) ? 'ring-2 ring-primary' : ''
                    } ${ticket.sla_breached ? 'border-l-4 border-l-destructive' : ''}`}
                    onClick={() => navigate(`/helpdesk/tickets/${ticket.id}`)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(ticket.id)}
                          onChange={() => handleSelectTicket(ticket.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1.5 h-4 w-4 rounded border-input"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <Badge variant="outline" className="font-mono">
                              {ticket.ticket_number}
                            </Badge>
                            <Badge variant="secondary">
                              {ticket.status.replace('_', ' ')}
                            </Badge>
                            <Badge 
                              className={
                                ticket.priority === 'urgent' ? 'bg-red-500 hover:bg-red-600' :
                                ticket.priority === 'high' ? 'bg-orange-500 hover:bg-orange-600' :
                                ticket.priority === 'medium' ? 'bg-yellow-500 hover:bg-yellow-600' :
                                'bg-green-500 hover:bg-green-600'
                              }
                            >
                              {ticket.priority}
                            </Badge>
                            {ticket.category && (
                              <Badge variant="outline">{ticket.category.name}</Badge>
                            )}
                            {ticket.sla_breached && (
                              <Badge variant="destructive" className="gap-1">
                                <Clock className="h-3 w-3" />
                                SLA Breached
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-base font-semibold mb-2">{ticket.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {ticket.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Created {new Date(ticket.created_at).toLocaleDateString()}</span>
                            {ticket.assignee && (
                              <span>• Assigned to {ticket.assignee.full_name}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="problems" className="space-y-6">
            {problems.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-20">
                  <div className="rounded-full bg-muted p-6 mb-4">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No problems found</h3>
                  <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
                    Create a problem record to track recurring issues and document solutions
                  </p>
                  <Button onClick={() => setCreateProblemOpen(true)} size="lg" className="gap-2">
                    <Plus className="h-5 w-5" />
                    Create First Problem
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {problems.map((problem: any) => (
                  <Card 
                    key={problem.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/helpdesk/problems/${problem.id}`)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="font-mono">
                          {problem.problem_number}
                        </Badge>
                        <Badge variant="secondary">
                          {problem.status}
                        </Badge>
                        <Badge 
                          className={
                            problem.priority === 'urgent' ? 'bg-red-500 hover:bg-red-600' :
                            problem.priority === 'high' ? 'bg-orange-500 hover:bg-orange-600' :
                            problem.priority === 'medium' ? 'bg-yellow-500 hover:bg-yellow-600' :
                            'bg-green-500 hover:bg-green-600'
                          }
                        >
                          {problem.priority}
                        </Badge>
                      </div>
                      <h3 className="text-base font-semibold mb-2">{problem.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {problem.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Created {new Date(problem.created_at).toLocaleDateString()}</span>
                        {problem.linked_ticket_ids && problem.linked_ticket_ids.length > 0 && (
                          <span>• {problem.linked_ticket_ids.length} linked tickets</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <CreateProblemDialog 
          open={createProblemOpen} 
          onOpenChange={setCreateProblemOpen} 
        />
      </div>
    </div>
  );
}
