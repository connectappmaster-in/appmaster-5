import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Ticket, AlertTriangle, LayoutGrid, Table as TableIcon, KanbanSquare, ArrowUpDown, Settings, BarChart3, Archive, Link as LinkIcon, BookOpen, Clock, ArrowLeft } from "lucide-react";
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
import { formatDistanceToNow, differenceInHours } from "date-fns";

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

  const getSLAStatus = (ticket: any) => {
    if (!ticket.sla_due_date || ticket.status === 'resolved' || ticket.status === 'closed') return null;
    
    const now = new Date();
    const dueDate = new Date(ticket.sla_due_date);
    const hoursRemaining = differenceInHours(dueDate, now);
    
    if (hoursRemaining < 0) {
      return { label: 'Breached', variant: 'destructive' as const, hours: Math.abs(hoursRemaining) };
    } else if (hoursRemaining < 2) {
      return { label: 'Critical', variant: 'destructive' as const, hours: hoursRemaining };
    } else if (hoursRemaining < 24) {
      return { label: 'Warning', variant: 'warning' as const, hours: hoursRemaining };
    }
    return { label: 'On Track', variant: 'secondary' as const, hours: hoursRemaining };
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/helpdesk')}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to HelpDesk
                </Button>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Tickets & Problems</h1>
              <p className="text-muted-foreground mt-1">Manage support tickets and track recurring problems</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/helpdesk/tickets/assignment-rules')} className="gap-2">
                <Settings className="h-4 w-4" />
                Rules
              </Button>
              <Button variant="outline" onClick={() => navigate('/helpdesk/tickets/reports')} className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Reports
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Button variant="outline" onClick={() => navigate('/helpdesk/tickets/closed-archive')} className="justify-start gap-2">
              <Archive className="h-4 w-4" />
              Closed Archive
            </Button>
            <Button variant="outline" onClick={() => navigate('/helpdesk/tickets/linked-problems')} className="justify-start gap-2">
              <LinkIcon className="h-4 w-4" />
              Linked Problems
            </Button>
            <Button variant="outline" onClick={() => navigate('/helpdesk/kb')} className="justify-start gap-2">
              <BookOpen className="h-4 w-4" />
              Knowledge Base
            </Button>
            <Button variant="outline" onClick={() => navigate('/helpdesk/sla')} className="justify-start gap-2">
              <Clock className="h-4 w-4" />
              SLA Policies
            </Button>
            <Button variant="outline" onClick={() => navigate('/helpdesk/tickets/assignment-rules')} className="justify-start gap-2">
              <Settings className="h-4 w-4" />
              Assignment Rules
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <TicketStatsCards />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
            <TabsList className="h-auto p-1">
              <TabsTrigger value="tickets" className="gap-2">
                <Ticket className="h-4 w-4" />
                All Tickets
                {tickets.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {tickets.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="problems" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                Problems
                {problems.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
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

              <Button variant="outline" onClick={() => setCreateProblemOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                New Problem
              </Button>
              <Button onClick={() => navigate('/helpdesk/new')} className="gap-2">
                <Plus className="h-4 w-4" />
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
                <CardContent className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading tickets...</p>
                  </div>
                </CardContent>
              </Card>
            ) : tickets.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Ticket className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
                  <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
                    {Object.keys(filters).length > 0 
                      ? "Try adjusting your filters to see more tickets" 
                      : "Get started by creating your first support ticket"}
                  </p>
                  {Object.keys(filters).length === 0 && (
                    <Button onClick={() => navigate('/helpdesk/new')} className="gap-2">
                      <Plus className="h-4 w-4" />
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
                {tickets.map((ticket: any) => {
                  const slaStatus = getSLAStatus(ticket);
                  return (
                    <Card 
                      key={ticket.id} 
                      className={`hover:shadow-md transition-all cursor-pointer border ${
                        selectedIds.includes(ticket.id) ? 'ring-2 ring-primary border-primary' : ''
                      } ${slaStatus?.variant === 'destructive' ? 'border-l-4 border-l-destructive' : ''}`}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(ticket.id)}
                            onChange={() => handleSelectTicket(ticket.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1.5 h-4 w-4"
                          />
                          <div 
                            className="flex-1 min-w-0"
                            onClick={() => navigate(`/helpdesk/tickets/${ticket.id}`)}
                          >
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge variant="outline" className="font-mono text-xs">
                                {ticket.ticket_number}
                              </Badge>
                              <Badge variant="secondary" className={
                                ticket.status === 'open' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                                ticket.status === 'in_progress' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
                                ticket.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                ticket.status === 'closed' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' :
                                'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                              }>
                                {ticket.status.replace('_', ' ')}
                              </Badge>
                              <Badge 
                                className={`text-white ${
                                  ticket.priority === 'urgent' ? 'bg-red-500 hover:bg-red-600' :
                                  ticket.priority === 'high' ? 'bg-orange-500 hover:bg-orange-600' :
                                  ticket.priority === 'medium' ? 'bg-yellow-500 hover:bg-yellow-600' :
                                  'bg-green-500 hover:bg-green-600'
                                }`}
                              >
                                {ticket.priority}
                              </Badge>
                              {ticket.category && (
                                <Badge variant="outline" className="text-xs">{ticket.category.name}</Badge>
                              )}
                              {slaStatus && (
                                <Badge 
                                  variant={slaStatus.variant === 'destructive' ? 'destructive' : 'secondary'}
                                  className="gap-1"
                                >
                                  <Clock className="h-3 w-3" />
                                  {slaStatus.label}: {Math.floor(slaStatus.hours)}h
                                </Badge>
                              )}
                            </div>
                            <h3 className="text-base font-semibold mb-1 truncate">{ticket.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {ticket.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                              <span>
                                Created {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                              </span>
                              {ticket.assignee && (
                                <span className="flex items-center gap-1">
                                  <span className="text-foreground">•</span>
                                  Assigned to <span className="text-foreground font-medium">{ticket.assignee.name}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="problems" className="mt-6 space-y-4">
            {problems.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <AlertTriangle className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No problems tracked</h3>
                  <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
                    Problems help track recurring issues and their root causes
                  </p>
                  <Button onClick={() => setCreateProblemOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create First Problem
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {problems.map((problem: any) => (
                  <Card key={problem.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge variant="outline" className="font-mono text-xs">
                              {problem.problem_number}
                            </Badge>
                            <Badge variant="secondary" className={
                              problem.status === 'open' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                              problem.status === 'in_progress' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
                              problem.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                            }>
                              {problem.status}
                            </Badge>
                            {problem.priority && (
                              <Badge 
                                className={`text-white ${
                                  problem.priority === 'urgent' ? 'bg-red-500 hover:bg-red-600' :
                                  problem.priority === 'high' ? 'bg-orange-500 hover:bg-orange-600' :
                                  problem.priority === 'medium' ? 'bg-yellow-500 hover:bg-yellow-600' :
                                  'bg-green-500 hover:bg-green-600'
                                }`}
                              >
                                {problem.priority}
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-base font-semibold mb-1">{problem.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {problem.description}
                          </p>
                          {problem.root_cause && (
                            <div className="mt-3 p-3 bg-muted/50 rounded-md">
                              <p className="text-xs font-medium mb-1">Root Cause</p>
                              <p className="text-sm">{problem.root_cause}</p>
                            </div>
                          )}
                          {problem.workaround && (
                            <div className="mt-2 p-3 bg-muted/30 rounded-md">
                              <p className="text-xs font-medium mb-1">Workaround</p>
                              <p className="text-sm">{problem.workaround}</p>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
                            <span>Created {formatDistanceToNow(new Date(problem.created_at), { addSuffix: true })}</span>
                          </div>
                        </div>
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
