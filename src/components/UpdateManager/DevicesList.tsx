import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  RefreshCw, 
  CheckCircle, 
  MoreHorizontal,
  Laptop,
  Monitor,
  Server,
  Clock,
  AlertTriangle,
  XCircle,
  Download
} from "lucide-react";
import { useUpdateDevices, useSyncAssets, useMarkUpdateCompleted, UpdateDevice } from "@/hooks/useUpdateManager";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const DeviceTypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "laptop":
      return <Laptop className="h-4 w-4" />;
    case "server":
      return <Server className="h-4 w-4" />;
    default:
      return <Monitor className="h-4 w-4" />;
  }
};

const StatusBadge = ({ status, isCompleted }: { status: string; isCompleted?: boolean }) => {
  if (isCompleted) {
    return (
      <Badge className="bg-green-100 text-green-800 border-green-300 gap-1">
        <CheckCircle className="h-3 w-3" />
        Completed (Manual)
      </Badge>
    );
  }

  const statusConfig: Record<string, { className: string; icon: React.ReactNode; label: string }> = {
    up_to_date: {
      className: "bg-green-100 text-green-800 border-green-300",
      icon: <CheckCircle className="h-3 w-3" />,
      label: "Up to Date",
    },
    pending: {
      className: "bg-yellow-100 text-yellow-800 border-yellow-300",
      icon: <Clock className="h-3 w-3" />,
      label: "Pending",
    },
    installing: {
      className: "bg-blue-100 text-blue-800 border-blue-300",
      icon: <Download className="h-3 w-3" />,
      label: "Installing",
    },
    reboot_required: {
      className: "bg-orange-100 text-orange-800 border-orange-300",
      icon: <RefreshCw className="h-3 w-3" />,
      label: "Reboot Required",
    },
    failed: {
      className: "bg-red-100 text-red-800 border-red-300",
      icon: <XCircle className="h-3 w-3" />,
      label: "Failed",
    },
    unknown: {
      className: "bg-gray-100 text-gray-800 border-gray-300",
      icon: <AlertTriangle className="h-3 w-3" />,
      label: "Unknown",
    },
  };

  const config = statusConfig[status] || statusConfig.unknown;

  return (
    <Badge variant="outline" className={`${config.className} gap-1`}>
      {config.icon}
      {config.label}
    </Badge>
  );
};

export const DevicesList = () => {
  const { data: devices, isLoading } = useUpdateDevices();
  const syncAssets = useSyncAssets();
  const markCompleted = useMarkUpdateCompleted();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [markCompletedDialog, setMarkCompletedDialog] = useState<UpdateDevice | null>(null);
  const [completionNotes, setCompletionNotes] = useState("");

  const filteredDevices = (devices || []).filter((device) => {
    const matchesSearch =
      device.device_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.asset_tag?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.owner_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "completed" ? device.is_completed_this_month : device.update_status === statusFilter);
    
    const matchesType = typeFilter === "all" || device.device_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filteredDevices.map((d) => d.id) : []);
  };

  const handleSelectDevice = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleMarkCompleted = () => {
    if (!markCompletedDialog) return;
    markCompleted.mutate(
      { deviceId: markCompletedDialog.id, notes: completionNotes },
      {
        onSuccess: () => {
          setMarkCompletedDialog(null);
          setCompletionNotes("");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search devices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="up_to_date">Up to Date</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="installing">Installing</SelectItem>
            <SelectItem value="reboot_required">Reboot Required</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="completed">Manual Completed</SelectItem>
            <SelectItem value="unknown">Unknown</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[130px] h-9">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="laptop">Laptops</SelectItem>
            <SelectItem value="desktop">Desktops</SelectItem>
            <SelectItem value="server">Servers</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncAssets.mutate()}
            disabled={syncAssets.isPending}
            className="gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${syncAssets.isPending ? "animate-spin" : ""}`} />
            Sync Assets
          </Button>
        </div>
      </div>

      {/* Table */}
      {filteredDevices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-lg">
          <div className="rounded-full bg-muted p-4 mb-3">
            <Monitor className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold mb-1">No devices found</h3>
          <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
            {devices?.length === 0
              ? "Click 'Sync Assets' to import devices from the Asset module"
              : "Try adjusting your filters"}
          </p>
          {devices?.length === 0 && (
            <Button onClick={() => syncAssets.mutate()} disabled={syncAssets.isPending}>
              <RefreshCw className={`h-4 w-4 mr-2 ${syncAssets.isPending ? "animate-spin" : ""}`} />
              Sync Assets Now
            </Button>
          )}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="h-10">
                <TableHead className="w-10">
                  <Checkbox
                    checked={selectedIds.length === filteredDevices.length && filteredDevices.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Check</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDevices.map((device) => (
                <TableRow key={device.id} className="h-12">
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(device.id)}
                      onCheckedChange={() => handleSelectDevice(device.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">{device.device_name}</div>
                      <div className="text-xs text-muted-foreground">{device.asset_tag}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm capitalize">
                      <DeviceTypeIcon type={device.device_type} />
                      {device.device_type}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{device.owner_name || "—"}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{device.location || "—"}</span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge 
                      status={device.update_status} 
                      isCompleted={device.is_completed_this_month} 
                    />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {device.last_update_check
                        ? format(new Date(device.last_update_check), "MMM d, HH:mm")
                        : "Never"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setMarkCompletedDialog(device)}
                          disabled={device.is_completed_this_month}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Completed
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Mark Completed Dialog */}
      <Dialog open={!!markCompletedDialog} onOpenChange={() => setMarkCompletedDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Update Completed</DialogTitle>
            <DialogDescription>
              Mark "{markCompletedDialog?.device_name}" as having completed updates for this month.
              This is a manual override for tracking purposes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                placeholder="e.g., Updates verified manually on the device..."
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMarkCompletedDialog(null)}>
              Cancel
            </Button>
            <Button onClick={handleMarkCompleted} disabled={markCompleted.isPending}>
              {markCompleted.isPending ? "Marking..." : "Mark Completed"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
