import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Filter, Calendar, Search, Eye, TrendingUp, BarChart, LayoutDashboard } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
interface Report {
  id: number;
  title: string;
  type: string;
  description: string;
  period: string;
  generated: string;
  status: 'ready' | 'generating' | 'failed';
  size: string;
}
export default function ReportsModule() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Empty reports array - ready for backend data
  const allReports: Report[] = [];

  // Client-side filtering
  const reports = allReports.filter(report => {
    if (typeFilter !== 'all' && report.type !== typeFilter) return false;
    if (statusFilter !== 'all' && report.status !== statusFilter) return false;
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      const matchesSearch = report.title?.toLowerCase().includes(search) || report.description?.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }
    return true;
  });
  const handleSelectReport = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? reports.map(r => r.id) : []);
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'generating':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  return <div className="min-h-screen bg-background">
      <div className="w-full px-4 pt-2 pb-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <TabsList className="h-8">
              <TabsTrigger value="overview" className="gap-1.5 px-3 text-sm h-7">
                <LayoutDashboard className="h-3.5 w-3.5" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="reports" className="gap-1.5 px-3 text-sm h-7">
                
                Reports
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("reports")}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <BarChart className="h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold">0</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Generated Reports</p>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("reports")}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-2xl font-bold">0</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Available Templates</p>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("reports")}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="text-2xl font-bold">0</span>
                  </div>
                  <p className="text-xs text-muted-foreground">This Month</p>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("reports")}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Download className="h-4 w-4 text-purple-600" />
                    <span className="text-2xl font-bold">0</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Downloads</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-2 mt-2">
            {/* Compact Single Row Header - Match Tickets Layout */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
          <div className="relative w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search reports..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-8" />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" size="sm" className="gap-1.5 h-8">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-sm">Date Range</span>
            </Button>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px] h-8">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="generating">Generating</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px] h-8">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="tickets">Tickets</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="sla">SLA</SelectItem>
                <SelectItem value="satisfaction">Satisfaction</SelectItem>
              </SelectContent>
            </Select>

            <Button size="sm" className="gap-1.5 h-8">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="text-sm">Generate</span>
            </Button>

            <Button variant="outline" size="sm" className="gap-1.5 h-8">
              <Download className="h-3.5 w-3.5" />
              <span className="text-sm">Export</span>
            </Button>
          </div>
        </div>

        {/* Table View - Match Tickets Layout */}
        {reports.length === 0 ? <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-lg">
            <div className="rounded-full bg-muted p-4 mb-3">
              <BarChart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold mb-1">No reports found</h3>
            <p className="text-xs text-muted-foreground mb-4 text-center max-w-md">
              {searchQuery || typeFilter !== 'all' || statusFilter !== 'all' ? "Try adjusting your filters to see more reports" : "Get started by generating your first report"}
            </p>
            {searchQuery === '' && typeFilter === 'all' && statusFilter === 'all' && <Button size="sm" className="gap-1.5 h-8">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="text-sm">Generate First Report</span>
              </Button>}
          </div> : <div className="border rounded-lg overflow-hidden text-[0.85rem]">
            <Table>
              <TableHeader>
                <TableRow className="h-9">
                  <TableHead className="w-10 py-2">
                    <Checkbox checked={selectedIds.length === reports.length && reports.length > 0} onCheckedChange={handleSelectAll} />
                  </TableHead>
                  <TableHead className="py-2">Report Name</TableHead>
                  <TableHead className="py-2">Type</TableHead>
                  <TableHead className="py-2">Description</TableHead>
                  <TableHead className="py-2">Period</TableHead>
                  <TableHead className="py-2">Status</TableHead>
                  <TableHead className="py-2">Size</TableHead>
                  <TableHead className="py-2">Generated</TableHead>
                  <TableHead className="text-right py-2">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map(report => <TableRow key={report.id} className="cursor-pointer hover:bg-muted/50 h-11">
                    <TableCell onClick={e => e.stopPropagation()} className="py-1.5">
                      <Checkbox checked={selectedIds.includes(report.id)} onCheckedChange={() => handleSelectReport(report.id)} />
                    </TableCell>
                    <TableCell className="py-1.5">
                      <div className="font-medium text-[0.85rem]">{report.title}</div>
                    </TableCell>
                    <TableCell className="py-1.5">
                      <Badge variant="outline" className="text-[0.75rem] px-1.5 py-0.5 capitalize">
                        {report.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-1.5">
                      <div className="max-w-md">
                        <div className="text-[0.8rem] text-muted-foreground truncate">
                          {report.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-1.5">
                      <span className="text-[0.8rem]">{report.period}</span>
                    </TableCell>
                    <TableCell className="py-1.5">
                      <Badge variant="outline" className={`${getStatusColor(report.status)} text-[0.75rem] px-1.5 py-0.5 capitalize`}>
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-1.5">
                      <span className="text-[0.8rem]">{report.size}</span>
                    </TableCell>
                    <TableCell className="py-1.5">
                      <div className="text-[0.8rem]">
                        {format(new Date(report.generated), 'MMM dd, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-1.5" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-end gap-0.5">
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="View">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Download">
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>)}
              </TableBody>
            </Table>
          </div>}
          </TabsContent>
        </Tabs>
      </div>
    </div>;
}