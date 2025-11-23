import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Download, 
  Search, 
  RefreshCw, 
  Settings,
  AlertTriangle,
  CheckCircle2,
  Clock
} from "lucide-react";
import { UpdateCard, SystemUpdate } from "@/components/SystemUpdates/UpdateCard";
import { UpdateFilters } from "@/components/SystemUpdates/UpdateFilters";
import { ScheduleUpdateDialog } from "@/components/SystemUpdates/ScheduleUpdateDialog";
import { UpdateDetailsDialog } from "@/components/SystemUpdates/UpdateDetailsDialog";
import { toast } from "sonner";

export default function SystemUpdates() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<SystemUpdate | undefined>();

  // Mock data - in production, this would come from your backend
  const [updates, setUpdates] = useState<SystemUpdate[]>([
    {
      id: "1",
      title: "Windows Server 2022 Cumulative Update",
      description: "Security improvements and bug fixes for Windows Server 2022",
      category: "windows",
      status: "pending",
      version: "KB5034441",
      date: "2024-01-15",
      size: "450 MB",
      severity: "high"
    },
    {
      id: "2",
      title: "SQL Server 2019 Service Pack",
      description: "Critical security patch for SQL Server 2019 databases",
      category: "server",
      status: "scheduled",
      version: "SP3 CU8",
      date: "2024-01-14",
      size: "1.2 GB",
      severity: "critical"
    },
    {
      id: "3",
      title: "Exchange Server Security Update",
      description: "Addresses zero-day vulnerability in Exchange Server",
      category: "critical",
      status: "pending",
      version: "KB5035857",
      date: "2024-01-13",
      size: "180 MB",
      severity: "critical"
    },
    {
      id: "4",
      title: "Windows Defender Definition Update",
      description: "Latest virus definitions and threat intelligence",
      category: "security",
      status: "installed",
      version: "1.403.1234.0",
      date: "2024-01-12",
      size: "95 MB",
      severity: "medium"
    },
    {
      id: "5",
      title: "Dell PowerEdge Firmware Update",
      description: "BIOS and firmware updates for Dell PowerEdge R750 servers",
      category: "firmware",
      status: "pending",
      version: "2.18.2",
      date: "2024-01-10",
      size: "320 MB",
      severity: "medium"
    },
    {
      id: "6",
      title: "Active Directory Domain Services Update",
      description: "Performance improvements and security fixes",
      category: "critical",
      status: "installing",
      version: "KB5034129",
      date: "2024-01-09",
      size: "210 MB",
      progress: 65,
      severity: "high"
    },
    {
      id: "7",
      title: "Microsoft Office 365 ProPlus Update",
      description: "Feature updates and security patches for Office applications",
      category: "application",
      status: "installed",
      version: "16.0.17126.20132",
      date: "2024-01-08",
      size: "890 MB",
      severity: "low"
    },
    {
      id: "8",
      title: "Hyper-V Host Update",
      description: "Critical update for Hyper-V virtualization platform",
      category: "server",
      status: "failed",
      version: "KB5034203",
      date: "2024-01-07",
      size: "156 MB",
      severity: "high"
    },
    {
      id: "9",
      title: "HPE iLO 5 Firmware",
      description: "Remote management firmware for HPE Gen10 servers",
      category: "firmware",
      status: "pending",
      version: "2.82",
      date: "2024-01-06",
      size: "78 MB",
      severity: "low"
    },
    {
      id: "10",
      title: "IIS Web Server Security Patch",
      description: "Fixes security vulnerabilities in Internet Information Services",
      category: "security",
      status: "pending",
      version: "KB5034768",
      date: "2024-01-05",
      size: "42 MB",
      severity: "critical"
    }
  ]);

  const filteredUpdates = updates.filter(update => {
    const matchesCategory = activeCategory === 'all' || update.category === activeCategory;
    const matchesSearch = update.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         update.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const counts = {
    all: updates.length,
    windows: updates.filter(u => u.category === 'windows').length,
    server: updates.filter(u => u.category === 'server').length,
    critical: updates.filter(u => u.category === 'critical').length,
    security: updates.filter(u => u.category === 'security').length,
    firmware: updates.filter(u => u.category === 'firmware').length,
    application: updates.filter(u => u.category === 'application').length,
  };

  const stats = {
    pending: updates.filter(u => u.status === 'pending').length,
    installed: updates.filter(u => u.status === 'installed').length,
    failed: updates.filter(u => u.status === 'failed').length,
  };

  const handleInstall = (id: string) => {
    setUpdates(prev => prev.map(u => 
      u.id === id ? { ...u, status: 'installing' as const, progress: 0 } : u
    ));
    toast.success("Update installation started");

    // Simulate installation progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUpdates(prev => prev.map(u => 
        u.id === id ? { ...u, progress: Math.min(progress, 100) } : u
      ));
      
      if (progress >= 100) {
        clearInterval(interval);
        setUpdates(prev => prev.map(u => 
          u.id === id ? { ...u, status: 'installed' as const, progress: undefined } : u
        ));
        toast.success("Update installed successfully");
      }
    }, 500);
  };

  const handleSchedule = (id: string) => {
    const update = updates.find(u => u.id === id);
    setSelectedUpdate(update);
    setScheduleDialogOpen(true);
  };

  const handleScheduleConfirm = (date: Date, time: string) => {
    if (selectedUpdate) {
      setUpdates(prev => prev.map(u => 
        u.id === selectedUpdate.id ? { ...u, status: 'scheduled' as const } : u
      ));
      toast.success(`Update scheduled for ${date.toLocaleDateString()} at ${time}`);
    }
  };

  const handleViewDetails = (id: string) => {
    const update = updates.find(u => u.id === id);
    setSelectedUpdate(update);
    setDetailsDialogOpen(true);
  };

  const handleRefresh = () => {
    toast.info("Checking for new updates...");
    // In production, this would fetch from your backend
  };

  const handleInstallAll = () => {
    const pendingUpdates = updates.filter(u => u.status === 'pending');
    if (pendingUpdates.length === 0) {
      toast.info("No pending updates to install");
      return;
    }
    toast.success(`Installing ${pendingUpdates.length} updates...`);
    pendingUpdates.forEach(u => handleInstall(u.id));
  };

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Updates Management</h2>
          <p className="text-muted-foreground">Monitor and manage Windows, server, and critical system updates</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Check Updates
          </Button>
          <Button onClick={handleInstallAll}>
            <Download className="h-4 w-4 mr-2" />
            Install All Pending
          </Button>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Updates</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Waiting for installation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Installed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.installed}</div>
            <p className="text-xs text-muted-foreground mt-1">Successfully completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failed}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <UpdateFilters 
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        counts={counts}
      />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search updates by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Updates List */}
      <div className="space-y-3">
        {filteredUpdates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No updates found matching your criteria</p>
            </CardContent>
          </Card>
        ) : (
          filteredUpdates.map((update) => (
            <UpdateCard
              key={update.id}
              update={update}
              onInstall={handleInstall}
              onSchedule={handleSchedule}
              onViewDetails={handleViewDetails}
            />
          ))
        )}
      </div>

      {/* Dialogs */}
      <ScheduleUpdateDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        updateTitle={selectedUpdate?.title}
        onSchedule={handleScheduleConfirm}
      />

      <UpdateDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        update={selectedUpdate}
      />
    </div>
  );
}
