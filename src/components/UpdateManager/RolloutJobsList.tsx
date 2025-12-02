import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  MoreHorizontal, 
  Play, 
  Pause, 
  XCircle,
  CheckCircle,
  Clock,
  Calendar,
  Eye,
  RotateCcw
} from "lucide-react";
import { useRolloutJobs, useUpdateJobStatus, RolloutJob } from "@/hooks/useUpdateManager";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { CreateJobDialog } from "./CreateJobDialog";

const StatusBadge = ({ status }: { status: RolloutJob["status"] }) => {
  const statusConfig: Record<string, { className: string; icon: React.ReactNode }> = {
    draft: {
      className: "bg-gray-100 text-gray-800 border-gray-300",
      icon: <Clock className="h-3 w-3" />,
    },
    scheduled: {
      className: "bg-blue-100 text-blue-800 border-blue-300",
      icon: <Calendar className="h-3 w-3" />,
    },
    running: {
      className: "bg-yellow-100 text-yellow-800 border-yellow-300",
      icon: <Play className="h-3 w-3" />,
    },
    paused: {
      className: "bg-orange-100 text-orange-800 border-orange-300",
      icon: <Pause className="h-3 w-3" />,
    },
    completed: {
      className: "bg-green-100 text-green-800 border-green-300",
      icon: <CheckCircle className="h-3 w-3" />,
    },
    failed: {
      className: "bg-red-100 text-red-800 border-red-300",
      icon: <XCircle className="h-3 w-3" />,
    },
    cancelled: {
      className: "bg-gray-100 text-gray-600 border-gray-300",
      icon: <XCircle className="h-3 w-3" />,
    },
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <Badge variant="outline" className={`${config.className} gap-1 capitalize`}>
      {config.icon}
      {status}
    </Badge>
  );
};

const JobTypeBadge = ({ type }: { type: RolloutJob["job_type"] }) => {
  const typeConfig: Record<string, string> = {
    standard: "bg-primary/10 text-primary",
    staged: "bg-purple-100 text-purple-800",
    emergency: "bg-red-100 text-red-800",
  };

  return (
    <Badge variant="outline" className={`${typeConfig[type]} capitalize`}>
      {type}
    </Badge>
  );
};

export const RolloutJobsList = () => {
  const { data: jobs, isLoading } = useRolloutJobs();
  const updateStatus = useUpdateJobStatus();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleStatusChange = (jobId: string, status: RolloutJob["status"]) => {
    updateStatus.mutate({ jobId, status });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex justify-end">
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Create Job
        </Button>
      </div>

      {/* Jobs List */}
      {!jobs || jobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-3">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold mb-1">No rollout jobs</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
              Create a rollout job to schedule and track update deployments across your devices.
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Job
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="h-10">
                <TableHead>Job Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id} className="h-12">
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">{job.name}</div>
                      {job.description && (
                        <div className="text-xs text-muted-foreground truncate max-w-xs">
                          {job.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <JobTypeBadge type={job.job_type} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={job.status} />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm capitalize">{job.target_type}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {job.scheduled_at
                        ? format(new Date(job.scheduled_at), "MMM d, HH:mm")
                        : "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(job.created_at), "MMM d, yyyy")}
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
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {job.status === "draft" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(job.id, "scheduled")}>
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule
                          </DropdownMenuItem>
                        )}
                        {job.status === "scheduled" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(job.id, "running")}>
                            <Play className="h-4 w-4 mr-2" />
                            Start Now
                          </DropdownMenuItem>
                        )}
                        {job.status === "running" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(job.id, "paused")}>
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                          </DropdownMenuItem>
                        )}
                        {job.status === "paused" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(job.id, "running")}>
                            <Play className="h-4 w-4 mr-2" />
                            Resume
                          </DropdownMenuItem>
                        )}
                        {job.status === "failed" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(job.id, "running")}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Retry
                          </DropdownMenuItem>
                        )}
                        {["draft", "scheduled", "running", "paused"].includes(job.status) && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(job.id, "cancelled")}
                              className="text-red-600"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CreateJobDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
};
