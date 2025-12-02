import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Ticket, AlertTriangle, Search, AlertCircle, Clock, CheckCircle2, Package } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUnifiedRequests, useUnifiedRequestsStats, type RequestType } from "@/hooks/useUnifiedRequests";
import { CreateProblemDialog } from "@/components/helpdesk/CreateProblemDialog";
import { CreateTicketDialog } from "@/components/helpdesk/CreateTicketDialog";
import { TicketFilters } from "@/components/helpdesk/TicketFilters";
import { BulkActionsButton } from "@/components/helpdesk/BulkActionsButton";
import { BulkActionsProblemButton } from "@/components/helpdesk/BulkActionsProblemButton";
import { TicketTableView } from "@/components/helpdesk/TicketTableView";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EditTicketDialog } from "@/components/helpdesk/EditTicketDialog";
import { AssignTicketDialog } from "@/components/helpdesk/AssignTicketDialog";
import { EditProblemDialog } from "@/components/helpdesk/EditProblemDialog";
import { AssignProblemDialog } from "@/components/helpdesk/AssignProblemDialog";
import { ProblemTableView } from "@/components/helpdesk/ProblemTableView";
import { useHelpdeskStats } from "@/hooks/useHelpdeskStats";
export default function TicketsModule() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [requestTypeFilter, setRequestTypeFilter] = useState<RequestType>('all');

  // Set active tab based on route
  useEffect(() => {
    if (location.pathname === "/helpdesk/problems") {
      setActiveTab("problems");
    }
  }, [location.pathname]);
  const [createProblemOpen, setCreateProblemOpen] = useState(false);
  const [createTicketOpen, setCreateTicketOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [editTicket, setEditTicket] = useState<any>(null);
  const [assignTicket, setAssignTicket] = useState<any>(null);
  const [editProblem, setEditProblem] = useState<any>(null);
  const [assignProblem, setAssignProblem] = useState<any>(null);
  const [selectedProblemIds, setSelectedProblemIds] = useState<number[]>([]);
  const [problemFilters, setProblemFilters] = useState<Record<string, any>>({});
  const {
    data: allRequests,
    isLoading
  } = useUnifiedRequests(requestTypeFilter);

  // Client-side filtering
  const requests = (allRequests || []).filter((request: any) => {
    if (filters.requestType && request.request_type !== filters.requestType) return false;
    if (filters.status && request.status !== filters.status) return false;
    if (filters.priority && request.priority !== filters.priority) return false;
    if (filters.category && request.category_id?.toString() !== filters.category) return false;
    if (filters.assignee === 'unassigned' && request.assignee_id) return false;
    if (filters.assignee && filters.assignee !== 'unassigned' && request.assignee_id !== filters.assignee) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      const matchesSearch = request.title?.toLowerCase().includes(search) || request.description?.toLowerCase().includes(search) || request.ticket_number?.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }
    if (filters.dateFrom && new Date(request.created_at) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(request.created_at) > new Date(filters.dateTo)) return false;
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
      } = await supabase.from('helpdesk_problems').select(`
          *,
          category:helpdesk_categories(name)
        `).eq('is_deleted', false).order('created_at', {
        ascending: false
      });
      if (error) throw error;

      // Fetch created_by and assigned_to users separately using auth_user_id
      if (data && data.length > 0) {
        const userAuthIds = [...new Set(
          data
            .flatMap((p: any) => [p.created_by, p.assigned_to])
            .filter(Boolean)
        )];

        if (userAuthIds.length > 0) {
          const { data: users } = await supabase
            .from('users')
            .select('id, auth_user_id, name, email')
            .in('auth_user_id', userAuthIds as string[]);

          if (users) {
            const userMap: Record<string, any> = Object.fromEntries(
              users.map((u: any) => [u.auth_user_id, u])
            );

            return data.map((problem: any) => ({
              ...problem,
              created_by_user: problem.created_by
                ? userMap[problem.created_by] || null
                : null,
              assigned_to_user: problem.assigned_to
                ? userMap[problem.assigned_to] || null
                : null
            }));
          }
        }
      }

      return data || [];
    }
  });

  // Client-side filtering for problems
  const problems = (allProblems || []).filter((problem: any) => {
    if (problemFilters.status && problem.status !== problemFilters.status) return false;
    if (problemFilters.priority && problem.priority !== problemFilters.priority) return false;
    if (problemFilters.search) {
      const search = problemFilters.search.toLowerCase();
      const matchesSearch = problem.title?.toLowerCase().includes(search) || problem.description?.toLowerCase().includes(search) || problem.problem_number?.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }
    return true;
  });
  const handleSelectTicket = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? requests.map((t: any) => t.id) : []);
  };
  const handleSelectProblem = (id: number) => {
    setSelectedProblemIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const handleSelectAllProblems = (checked: boolean) => {
    setSelectedProblemIds(checked ? problems.map((p: any) => p.id) : []);
  };
  const {
    data: stats,
    isLoading: statsLoading
  } = useUnifiedRequestsStats();
  const quickLinks: any[] = [];
  return <div className="min-h-screen bg-background">
      <div className="w-full px-4 pt-2 pb-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-2">
          {/* Compact Single Row Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <TabsList className="h-8">
              <TabsTrigger value="overview" className="gap-1.5 px-3 text-sm h-7">
                Overview
              </TabsTrigger>
              <TabsTrigger value="tickets" className="gap-1.5 px-3 text-sm h-7" onClick={() => setRequestTypeFilter('all')}>
                Tickets
              </TabsTrigger>
              <TabsTrigger value="problems" className="gap-1.5 px-3 text-sm h-7">
                Problems
              </TabsTrigger>
            </TabsList>

            {activeTab === 'tickets' && <>
                <div className="relative w-[250px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search tickets and requests..." value={filters.search || ''} onChange={e => setFilters({
                ...filters,
                search: e.target.value
              })} className="pl-9 h-8" />
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <BulkActionsButton selectedIds={selectedIds} onClearSelection={() => setSelectedIds([])} />
                  
                  <Select value={filters.requestType || 'all'} onValueChange={value => setFilters({
                ...filters,
                requestType: value === 'all' ? null : value
              })}>
                    <SelectTrigger className="w-[140px] h-8">
                      <SelectValue placeholder="Request Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="ticket">Tickets</SelectItem>
                      <SelectItem value="service_request">Service Requests</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.status || 'all'} onValueChange={value => setFilters({
                ...filters,
                status: value === 'all' ? null : value
              })}>
                    <SelectTrigger className="w-[120px] h-8">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.priority || 'all'} onValueChange={value => setFilters({
                ...filters,
                priority: value === 'all' ? null : value
              })}>
                    <SelectTrigger className="w-[120px] h-8">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button size="sm" onClick={() => setCreateTicketOpen(true)} className="gap-1.5 h-8">
                    <Plus className="h-3.5 w-3.5" />
                    <span className="text-sm">New Request</span>
                  </Button>
                </div>
              </>}

            {activeTab === 'problems' && <>
                <div className="relative w-[250px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search problems..." value={problemFilters.search || ''} onChange={e => setProblemFilters({
                ...problemFilters,
                search: e.target.value
              })} className="pl-9 h-8" />
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <BulkActionsProblemButton selectedIds={selectedProblemIds} onClearSelection={() => setSelectedProblemIds([])} />
                  
                  <Select value={problemFilters.status || 'all'} onValueChange={value => setProblemFilters({
                ...problemFilters,
                status: value === 'all' ? null : value
              })}>
                    <SelectTrigger className="w-[120px] h-8">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="known_error">Known Error</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={problemFilters.priority || 'all'} onValueChange={value => setProblemFilters({
                ...problemFilters,
                priority: value === 'all' ? null : value
              })}>
                    <SelectTrigger className="w-[120px] h-8">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button size="sm" onClick={() => setCreateProblemOpen(true)} className="gap-1.5 h-8">
                    <Plus className="h-3.5 w-3.5" />
                    <span className="text-sm">New Problem</span>
                  </Button>
                </div>
              </>}
          </div>

          <TabsContent value="overview" className="space-y-4 mt-2">
            {/* Quick Action Buttons */}
            <div className="flex items-center gap-3">
              <Button onClick={() => setCreateTicketOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                New Ticket
              </Button>
              <Button onClick={() => setCreateProblemOpen(true)} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                New Problem
              </Button>
            </div>

            {statsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {/* Tickets Section */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tickets Overview</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <Card 
                      className="cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all" 
                      onClick={() => {
                        setActiveTab("tickets");
                        setFilters({ requestType: 'ticket' });
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Ticket className="h-4 w-4 text-primary" />
                        </div>
                        <p className="text-2xl font-bold">{stats?.tickets?.total || 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">Total Tickets</p>
                      </CardContent>
                    </Card>

                    <Card 
                      className="cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all" 
                      onClick={() => {
                        setActiveTab("tickets");
                        setFilters({ requestType: 'ticket', status: 'open' });
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                        </div>
                        <p className="text-2xl font-bold">{stats?.tickets?.open || 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">Open</p>
                      </CardContent>
                    </Card>

                    <Card 
                      className="cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all" 
                      onClick={() => {
                        setActiveTab("tickets");
                        setFilters({ requestType: 'ticket', status: 'in_progress' });
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                        </div>
                        <p className="text-2xl font-bold">{stats?.tickets?.inProgress || 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">In Progress</p>
                      </CardContent>
                    </Card>

                    <Card 
                      className="cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all" 
                      onClick={() => {
                        setActiveTab("tickets");
                        setFilters({ requestType: 'ticket', status: 'resolved' });
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold">{stats?.tickets?.resolved || 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">Resolved</p>
                      </CardContent>
                    </Card>

                    <Card 
                      className="cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all" 
                      onClick={() => {
                        setActiveTab("tickets");
                        setFilters({ requestType: 'ticket', priority: 'urgent' });
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        </div>
                        <p className="text-2xl font-bold">{stats?.tickets?.urgent || 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">Urgent</p>
                      </CardContent>
                    </Card>

                    <Card 
                      className="cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all" 
                      onClick={() => {
                        setActiveTab("tickets");
                        setFilters({ requestType: 'ticket' });
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Ticket className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-2xl font-bold">{stats?.recentTickets || 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">Last 7 Days</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Service Requests Section */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Service Requests</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <Card 
                      className="cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all" 
                      onClick={() => {
                        setActiveTab("tickets");
                        setFilters({ requestType: 'service_request' });
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Package className="h-4 w-4 text-primary" />
                        </div>
                        <p className="text-2xl font-bold">{stats?.serviceRequests?.total || 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">Total Requests</p>
                      </CardContent>
                    </Card>

                    <Card 
                      className="cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all" 
                      onClick={() => {
                        setActiveTab("tickets");
                        setFilters({ requestType: 'service_request', status: 'open' });
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                        </div>
                        <p className="text-2xl font-bold">{stats?.serviceRequests?.pending || 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">Pending</p>
                      </CardContent>
                    </Card>

                    <Card 
                      className="cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all" 
                      onClick={() => {
                        setActiveTab("tickets");
                        setFilters({ requestType: 'service_request', status: 'in_progress' });
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Clock className="h-4 w-4 text-orange-500" />
                        </div>
                        <p className="text-2xl font-bold">{stats?.serviceRequests?.inProgress || 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">In Progress</p>
                      </CardContent>
                    </Card>

                    <Card 
                      className="cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all" 
                      onClick={() => {
                        setActiveTab("tickets");
                        setFilters({ requestType: 'service_request', status: 'fulfilled' });
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold">{stats?.serviceRequests?.fulfilled || 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">Fulfilled</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Problems Section */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Problems</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    <Card 
                      className="cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all" 
                      onClick={() => {
                        setActiveTab("problems");
                        setProblemFilters({});
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <AlertTriangle className="h-4 w-4 text-primary" />
                        </div>
                        <p className="text-2xl font-bold">{problems?.length || 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">Total Problems</p>
                      </CardContent>
                    </Card>

                    <Card 
                      className="cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all" 
                      onClick={() => {
                        setActiveTab("problems");
                        setProblemFilters({ status: 'open' });
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                        </div>
                        <p className="text-2xl font-bold">
                          {problems?.filter((p: any) => p.status === 'open').length || 0}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Open</p>
                      </CardContent>
                    </Card>

                    <Card 
                      className="cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all" 
                      onClick={() => {
                        setActiveTab("problems");
                        setProblemFilters({ status: 'in_progress' });
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                        </div>
                        <p className="text-2xl font-bold">
                          {problems?.filter((p: any) => p.status === 'in_progress').length || 0}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">In Progress</p>
                      </CardContent>
                    </Card>

                    <Card 
                      className="cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all" 
                      onClick={() => {
                        setActiveTab("problems");
                        setProblemFilters({ status: 'resolved' });
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold">
                          {problems?.filter((p: any) => p.status === 'resolved').length || 0}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Resolved</p>
                      </CardContent>
                    </Card>

                    <Card 
                      className="cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all" 
                      onClick={() => {
                        setActiveTab("problems");
                        setProblemFilters({ priority: 'urgent' });
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        </div>
                        <p className="text-2xl font-bold">
                          {problems?.filter((p: any) => p.priority === 'urgent').length || 0}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Urgent</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="tickets" className="space-y-2 mt-2">
            {isLoading ? <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              </div> : requests.length === 0 ? <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-lg">
                <div className="rounded-full bg-muted p-4 mb-3">
                  <Ticket className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold mb-1">No requests found</h3>
                <p className="text-xs text-muted-foreground mb-4 text-center max-w-md">
                  {Object.keys(filters).length > 0 ? "Try adjusting your filters to see more requests" : "Get started by creating your first ticket or service request"}
                </p>
                {Object.keys(filters).length === 0 && <Button onClick={() => setCreateTicketOpen(true)} size="sm" className="gap-1.5 h-8">
                    <Plus className="h-3.5 w-3.5" />
                    <span className="text-sm">Create First Request</span>
                  </Button>}
              </div> : <TicketTableView tickets={requests} selectedIds={selectedIds} onSelectTicket={handleSelectTicket} onSelectAll={handleSelectAll} onEditTicket={setEditTicket} onAssignTicket={setAssignTicket} />}
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
              </div> : <ProblemTableView problems={problems} selectedIds={selectedProblemIds} onSelectProblem={handleSelectProblem} onSelectAll={handleSelectAllProblems} onEditProblem={setEditProblem} onAssignProblem={setAssignProblem} />}
          </TabsContent>
        </Tabs>

        <CreateTicketDialog open={createTicketOpen} onOpenChange={setCreateTicketOpen} />
        <CreateProblemDialog open={createProblemOpen} onOpenChange={setCreateProblemOpen} />
        {editTicket && <EditTicketDialog open={!!editTicket} onOpenChange={open => !open && setEditTicket(null)} ticket={editTicket} />}
        {assignTicket && <AssignTicketDialog open={!!assignTicket} onOpenChange={open => !open && setAssignTicket(null)} ticket={assignTicket} />}
        {editProblem && <EditProblemDialog open={!!editProblem} onOpenChange={open => !open && setEditProblem(null)} problem={editProblem} />}
        {assignProblem && <AssignProblemDialog open={!!assignProblem} onOpenChange={open => !open && setAssignProblem(null)} problem={assignProblem} />}
      </div>
    </div>;
}