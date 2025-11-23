import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Ticket, AlertTriangle, LayoutGrid, Table as TableIcon, KanbanSquare, ArrowUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreateProblemDialog } from "@/components/helpdesk/CreateProblemDialog";
import { TicketStatsCards } from "@/components/helpdesk/TicketStatsCards";
import { TicketFilters } from "@/components/helpdesk/TicketFilters";
import { BulkActionsToolbar } from "@/components/helpdesk/BulkActionsToolbar";
import { TicketTableView } from "@/components/helpdesk/TicketTableView";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function TicketsModule() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("tickets");
  const [createProblemOpen, setCreateProblemOpen] = useState(false);
  const [view, setView] = useState<'list' | 'table' | 'kanban'>('list');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data: allTickets, isLoading } = useQuery({
    queryKey: ['helpdesk-tickets-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('helpdesk_tickets')
        .select('*, category:helpdesk_categories(name)')
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
    if (filters.assignee === 'unassigned' && ticket.assigned_to) return false;
    if (filters.assignee && filters.assignee !== 'unassigned' && ticket.assigned_to !== filters.assignee) return false;
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
  }).sort((a: any, b: any) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="max-w-7xl space-y-6">
      {/* Stats Cards */}
      <TicketStatsCards />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="tickets">
              <Ticket className="h-4 w-4 mr-2" />
              All Tickets
              {tickets.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {tickets.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="problems">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Problems
              {problems.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {problems.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2 flex-wrap">
            {activeTab === 'tickets' && (
              <>
                {/* Sort Controls */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px]">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Created Date</SelectItem>
                    <SelectItem value="updated_at">Updated Date</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                >
                  <ArrowUpDown className={`h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                </Button>

                {/* View Switcher */}
                <div className="flex border rounded-md">
                  <Button
                    variant={view === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setView('list')}
                    className="rounded-r-none"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={view === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setView('table')}
                    className="rounded-none border-x"
                  >
                    <TableIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={view === 'kanban' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setView('kanban')}
                    className="rounded-l-none"
                    title="Coming Soon"
                    disabled
                  >
                    <KanbanSquare className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}

            <Button variant="outline" onClick={() => setCreateProblemOpen(true)}>
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
          {/* Filters */}
          <TicketFilters onFilterChange={setFilters} activeFilters={filters} />

          {/* Bulk Actions */}
          {selectedIds.length > 0 && (
            <BulkActionsToolbar
              selectedIds={selectedIds}
              onClearSelection={() => setSelectedIds([])}
            />
          )}

          {/* Tickets List/Table */}
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading tickets...</p>
                </div>
              </CardContent>
            </Card>
          ) : tickets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Ticket className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">No tickets found</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {Object.keys(filters).length > 0 
                    ? "Try adjusting your filters" 
                    : "Create your first ticket to get started"}
                </p>
                {Object.keys(filters).length === 0 && (
                  <Button variant="outline" onClick={() => navigate('/helpdesk/new')}>
                    <Plus className="h-4 w-4 mr-2" />
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
                  className={`hover:shadow-lg transition-shadow cursor-pointer ${
                    selectedIds.includes(ticket.id) ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(ticket.id)}
                        onChange={() => handleSelectTicket(ticket.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1"
                      />
                      <div 
                        className="flex-1"
                        onClick={() => navigate(`/helpdesk/tickets/${ticket.id}`)}
                      >
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge variant="outline" className="font-mono">
                            {ticket.ticket_number}
                          </Badge>
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                          <Badge 
                            className={
                              ticket.priority === 'urgent' ? 'bg-red-500' :
                              ticket.priority === 'high' ? 'bg-orange-500' :
                              ticket.priority === 'medium' ? 'bg-yellow-500' :
                              'bg-green-500'
                            }
                          >
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
                          <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="problems" className="mt-6 space-y-4">
          {problems.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No problems tracked</p>
              </CardContent>
            </Card>
          ) : (
            problems.map((problem: any) => (
              <Card key={problem.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="font-mono">
                          {problem.problem_number}
                        </Badge>
                        <Badge className={getStatusColor(problem.status)}>
                          {problem.status}
                        </Badge>
                        {problem.priority && (
                          <Badge 
                            className={
                              problem.priority === 'urgent' ? 'bg-red-500' :
                              problem.priority === 'high' ? 'bg-orange-500' :
                              problem.priority === 'medium' ? 'bg-yellow-500' :
                              'bg-green-500'
                            }
                          >
                            {problem.priority}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold mb-1">{problem.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {problem.description?.substring(0, 200)}
                        {problem.description?.length > 200 ? '...' : ''}
                      </p>
                      {problem.root_cause && (
                        <p className="text-sm mt-2">
                          <span className="font-medium">Root Cause:</span> {problem.root_cause}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
      
      <CreateProblemDialog 
        open={createProblemOpen} 
        onOpenChange={setCreateProblemOpen} 
      />
    </div>
  );
}
