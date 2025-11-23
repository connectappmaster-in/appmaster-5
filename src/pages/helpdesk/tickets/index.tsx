import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Ticket, AlertTriangle, LayoutGrid, Table as TableIcon, Archive, Link as LinkIcon, BookOpen, Clock, Settings, BarChart3 } from "lucide-react";
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
  const {
    data: allTickets,
    isLoading
  } = useQuery({
    queryKey: ['helpdesk-tickets-all'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('helpdesk_tickets').select('*, category:helpdesk_categories(name), assignee:helpdesk_tickets_assignee_id_fkey(full_name)').order('created_at', {
        ascending: false
      });
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
      const matchesSearch = ticket.title?.toLowerCase().includes(search) || ticket.description?.toLowerCase().includes(search) || ticket.ticket_number?.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }
    if (filters.dateFrom && new Date(ticket.created_at) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(ticket.created_at) > new Date(filters.dateTo)) return false;
    return true;
  });
  const {
    data: allProblems
  } = useQuery({
    queryKey: ['helpdesk-problems'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('helpdesk_problems').select('*').order('created_at', {
        ascending: false
      });
      if (error) throw error;
      return data || [];
    }
  });
  const problems = allProblems || [];
  const handleSelectTicket = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? tickets.map((t: any) => t.id) : []);
  };
  const quickLinks = [{
    icon: Archive,
    label: "Closed Archive",
    path: "/helpdesk/tickets/closed-archive"
  }, {
    icon: LinkIcon,
    label: "Linked Problems",
    path: "/helpdesk/tickets/linked-problems"
  }, {
    icon: BookOpen,
    label: "Knowledge Base",
    path: "/helpdesk/kb"
  }, {
    icon: Clock,
    label: "SLA Policies",
    path: "/helpdesk/sla"
  }, {
    icon: Settings,
    label: "Assignment Rules",
    path: "/helpdesk/tickets/assignment-rules"
  }];
  return <div className="min-h-screen bg-background">
      <div className="w-full px-4 py-3">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-end mb-3 gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/helpdesk/tickets/reports')} className="gap-1.5 h-8">
              <BarChart3 className="h-3.5 w-3.5" />
              <span className="text-sm">Reports</span>
            </Button>
            <Button size="sm" onClick={() => navigate('/helpdesk/new')} className="gap-1.5 h-8">
              <Plus className="h-3.5 w-3.5" />
              <span className="text-sm">New Ticket</span>
            </Button>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {quickLinks.map(link => {
            const Icon = link.icon;
            return <Button key={link.path} variant="outline" size="sm" onClick={() => navigate(link.path)} className="gap-1.5 h-7 px-2.5 text-xs">
                  <Icon className="h-3 w-3" />
                  <span>{link.label}</span>
                </Button>;
          })}
          </div>

          {/* Stats Cards */}
          <TicketStatsCards />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
          {/* Tabs Header with Actions */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2">
            <TabsList className="h-9">
              <TabsTrigger value="tickets" className="gap-1.5 px-4 text-sm">
                <Ticket className="h-3.5 w-3.5" />
                All Tickets
                {tickets.length > 0 && <Badge variant="secondary" className="ml-1.5 text-xs px-1.5 py-0">
                    {tickets.length}
                  </Badge>}
              </TabsTrigger>
              <TabsTrigger value="problems" className="gap-1.5 px-4 text-sm">
                <AlertTriangle className="h-3.5 w-3.5" />
                Problems
                {problems.length > 0 && <Badge variant="secondary" className="ml-1.5 text-xs px-1.5 py-0">
                    {problems.length}
                  </Badge>}
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              {activeTab === 'tickets' && <div className="flex gap-1.5">
                  <Button variant={view === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setView('list')} className="gap-1.5 h-8 px-3">
                    <LayoutGrid className="h-3.5 w-3.5" />
                    <span className="text-sm">List</span>
                  </Button>
                  <Button variant={view === 'table' ? 'default' : 'outline'} size="sm" onClick={() => setView('table')} className="gap-1.5 h-8 px-3">
                    <TableIcon className="h-3.5 w-3.5" />
                    <span className="text-sm">Table</span>
                  </Button>
                </div>}
              <Button variant="outline" size="sm" onClick={() => setCreateProblemOpen(true)} className="gap-1.5 h-8">
                <Plus className="h-3.5 w-3.5" />
                <span className="text-sm">New Problem</span>
              </Button>
            </div>
          </div>

          <TabsContent value="tickets" className="space-y-2">
            {/* Filters */}
            <TicketFilters onFilterChange={setFilters} activeFilters={filters} />

            {/* Bulk Actions */}
            {selectedIds.length > 0 && <BulkActionsToolbar selectedIds={selectedIds} onClearSelection={() => setSelectedIds([])} />}

            {/* Tickets Content */}
            {isLoading ? <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground">Loading tickets...</p>
                </div>
              </div> : tickets.length === 0 ? <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-lg">
                <div className="rounded-full bg-muted p-4 mb-3">
                  <Ticket className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold mb-1">No tickets found</h3>
                <p className="text-xs text-muted-foreground mb-4 text-center max-w-md">
                  {Object.keys(filters).length > 0 ? "Try adjusting your filters to see more tickets" : "Get started by creating your first support ticket"}
                </p>
                {Object.keys(filters).length === 0 && <Button onClick={() => navigate('/helpdesk/new')} size="sm" className="gap-1.5 h-8">
                    <Plus className="h-3.5 w-3.5" />
                    <span className="text-sm">Create First Ticket</span>
                  </Button>}
              </div> : view === 'table' ? <TicketTableView tickets={tickets} selectedIds={selectedIds} onSelectTicket={handleSelectTicket} onSelectAll={handleSelectAll} /> : <div className="space-y-1.5">
                {tickets.map((ticket: any) => <div key={ticket.id} className={`hover:bg-accent/50 transition-colors cursor-pointer p-3 rounded-md border ${selectedIds.includes(ticket.id) ? 'ring-2 ring-primary' : ''} ${ticket.sla_breached ? 'border-l-4 border-l-destructive' : ''}`} onClick={() => navigate(`/helpdesk/tickets/${ticket.id}`)}>
                    <div className="flex items-start gap-2">
                      <input type="checkbox" checked={selectedIds.includes(ticket.id)} onChange={() => handleSelectTicket(ticket.id)} onClick={e => e.stopPropagation()} className="mt-0.5 h-3.5 w-3.5 rounded border-input" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                          <Badge variant="outline" className="font-mono text-[10px] h-5 px-1.5">
                            {ticket.ticket_number}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={`text-[10px] h-5 px-1.5 ${ticket.priority === 'urgent' ? 'bg-red-500 hover:bg-red-600' : ticket.priority === 'high' ? 'bg-orange-500 hover:bg-orange-600' : ticket.priority === 'medium' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}`}>
                            {ticket.priority}
                          </Badge>
                          {ticket.category && <Badge variant="outline" className="text-[10px] h-5 px-1.5">{ticket.category.name}</Badge>}
                          {ticket.sla_breached && <Badge variant="destructive" className="gap-1 text-[10px] h-5 px-1.5">
                              <Clock className="h-2.5 w-2.5" />
                              SLA Breached
                            </Badge>}
                        </div>
                        <h3 className="text-sm font-medium mb-0.5">{ticket.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
                          {ticket.description}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span>Created {new Date(ticket.created_at).toLocaleDateString()}</span>
                          {ticket.assignee && <span>• Assigned to {ticket.assignee.full_name}</span>}
                        </div>
                      </div>
                    </div>
                  </div>)}
              </div>}
          </TabsContent>

          <TabsContent value="problems" className="space-y-2">
            {problems.length === 0 ? <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-lg">
                <div className="rounded-full bg-muted p-4 mb-3">
                  <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold mb-1">No problems found</h3>
                <p className="text-xs text-muted-foreground mb-4 text-center max-w-md">
                  Create a problem record to track recurring issues and document solutions
                </p>
                <Button onClick={() => setCreateProblemOpen(true)} size="sm" className="gap-1.5 h-8">
                  <Plus className="h-3.5 w-3.5" />
                  <span className="text-sm">Create First Problem</span>
                </Button>
              </div> : <div className="space-y-1.5">
                {problems.map((problem: any) => <div key={problem.id} className="hover:bg-accent/50 transition-colors cursor-pointer p-3 rounded-md border" onClick={() => navigate(`/helpdesk/problems/${problem.id}`)}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Badge variant="outline" className="font-mono text-[10px] h-5 px-1.5">
                        {problem.problem_number}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                        {problem.status}
                      </Badge>
                      <Badge className={`text-[10px] h-5 px-1.5 ${problem.priority === 'urgent' ? 'bg-red-500 hover:bg-red-600' : problem.priority === 'high' ? 'bg-orange-500 hover:bg-orange-600' : problem.priority === 'medium' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}`}>
                        {problem.priority}
                      </Badge>
                    </div>
                    <h3 className="text-sm font-medium mb-0.5">{problem.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
                      {problem.description}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>Created {new Date(problem.created_at).toLocaleDateString()}</span>
                      {problem.linked_ticket_ids && problem.linked_ticket_ids.length > 0 && <span>• {problem.linked_ticket_ids.length} linked tickets</span>}
                    </div>
                  </div>)}
              </div>}
          </TabsContent>
        </Tabs>

        <CreateProblemDialog open={createProblemOpen} onOpenChange={setCreateProblemOpen} />
      </div>
    </div>;
}