import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Play, XCircle, AlertCircle } from "lucide-react";
export const WorkerJobsMonitor = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchJobs();
  }, []);
  const fetchJobs = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from("saas_worker_jobs").select("*").order("created_at", {
        ascending: false
      }).limit(50);
      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };
  const getStatusBadge = (status: string) => {
    const variants: Record<string, {
      color: string;
      icon: any;
    }> = {
      pending: {
        color: "bg-yellow-500",
        icon: RefreshCw
      },
      processing: {
        color: "bg-blue-500",
        icon: RefreshCw
      },
      completed: {
        color: "bg-green-500",
        icon: null
      },
      failed: {
        color: "bg-red-500",
        icon: AlertCircle
      }
    };
    const variant = variants[status] || variants.pending;
    const Icon = variant.icon;
    return <Badge className={variant.color}>
        {Icon && <Icon className="w-3 h-3 mr-1" />}
        {status}
      </Badge>;
  };
  return <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          
          <p className="text-muted-foreground">Monitor and manage worker jobs</p>
        </div>
        <Button onClick={fetchJobs} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Pending</div>
          <div className="text-2xl font-bold">
            {jobs.filter(j => j.status === "pending").length}
          </div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Processing</div>
          <div className="text-2xl font-bold">
            {jobs.filter(j => j.status === "processing").length}
          </div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Completed</div>
          <div className="text-2xl font-bold text-green-600">
            {jobs.filter(j => j.status === "completed").length}
          </div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Failed</div>
          <div className="text-2xl font-bold text-red-600">
            {jobs.filter(j => j.status === "failed").length}
          </div>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead>Retries</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Loading jobs...
                </TableCell>
              </TableRow> : jobs.length === 0 ? <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No jobs found
                </TableCell>
              </TableRow> : jobs.map(job => <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.job_type}</TableCell>
                  <TableCell>{getStatusBadge(job.status)}</TableCell>
                  <TableCell className="text-sm">
                    {new Date(job.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm">
                    {job.completed_at ? new Date(job.completed_at).toLocaleString() : "-"}
                  </TableCell>
                  <TableCell>
                    {job.retries > 0 && <Badge variant="outline">
                        {job.retries}/{job.max_retries}
                      </Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {job.status === "failed" && <Button variant="outline" size="sm" className="gap-1">
                          <Play className="w-3 h-3" />
                          Retry
                        </Button>}
                      {(job.status === "pending" || job.status === "processing") && <Button variant="ghost" size="sm" className="gap-1">
                          <XCircle className="w-3 h-3" />
                          Cancel
                        </Button>}
                    </div>
                  </TableCell>
                </TableRow>)}
          </TableBody>
        </Table>
      </div>
    </div>;
};