import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";
import { Play, Eye, Clock, CheckCircle, XCircle } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const DepreciationRun = () => {
  const queryClient = useQueryClient();
  const [isRunning, setIsRunning] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [confirmRunOpen, setConfirmRunOpen] = useState(false);

  const { data: runLogs = [] } = useQuery({
    queryKey: ["depreciation-run-logs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("depreciation_run_logs")
        .select("*")
        .order("run_date", { ascending: false })
        .limit(20);
      return data || [];
    },
  });

  const runDepreciation = useMutation({
    mutationFn: async (dryRun: boolean) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profileData } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", user.id)
        .maybeSingle();

      const tenantId = profileData?.tenant_id || 1;

      const { data, error } = await supabase.functions.invoke('depreciation-run', {
        body: { tenantId, dryRun },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, dryRun) => {
      if (dryRun) {
        setPreview(data);
        toast.success("Preview generated successfully");
      } else {
        queryClient.invalidateQueries({ queryKey: ["depreciation-run-logs"] });
        queryClient.invalidateQueries({ queryKey: ["depreciation-entries"] });
        queryClient.invalidateQueries({ queryKey: ["itam-assets"] });
        toast.success(`Depreciation run complete. ${data.entriesCreated} entries created.`);
        setPreview(null);
      }
      setIsRunning(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Depreciation run failed");
      setIsRunning(false);
    },
  });

  const handleDryRun = () => {
    setIsRunning(true);
    runDepreciation.mutate(true);
  };

  const handleActualRun = () => {
    setConfirmRunOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      success: "bg-green-100 text-green-800",
      partial_success: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
    };
    return variants[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <>
    <div className="min-h-screen bg-background">
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-2xl font-bold">Run Depreciation</h1>
              <p className="text-sm text-muted-foreground">
                Execute monthly depreciation calculations
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDryRun}
              disabled={isRunning}
            >
              <Eye className="h-4 w-4 mr-2" />
              Dry Run (Preview)
            </Button>
            <Button
              onClick={handleActualRun}
              disabled={isRunning}
            >
              <Play className="h-4 w-4 mr-2" />
              Run Depreciation
            </Button>
          </div>
        </div>

        {preview && (
          <Card>
            <CardHeader>
              <CardTitle>Preview Results</CardTitle>
              <CardDescription>
                Review the depreciation entries that will be created
              </CardDescription>
            </CardHeader>
            <CardContent>
              {preview.preview && preview.preview.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset ID</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">Depreciation</TableHead>
                      <TableHead className="text-right">Accumulated</TableHead>
                      <TableHead className="text-right">Book Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.preview.map((entry: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{entry.asset_id}</TableCell>
                        <TableCell>
                          {format(new Date(entry.period_start), "MMM yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          INR {entry.depreciation_amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          INR {entry.accumulated_depreciation.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          INR {entry.book_value.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No entries to create for this period
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Run History</CardTitle>
            <CardDescription>Past depreciation runs</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Run Date</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Entries Created</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No runs yet
                    </TableCell>
                  </TableRow>
                ) : (
                  runLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(log.run_date), "MMM dd, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        {format(new Date(log.period_start), "MMM yyyy")}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {log.entries_created}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(log.status)}>
                          {log.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
    
    <ConfirmDialog
      open={confirmRunOpen}
      onOpenChange={setConfirmRunOpen}
      onConfirm={() => {
        setIsRunning(true);
        runDepreciation.mutate(false);
        setConfirmRunOpen(false);
      }}
      title="Run Depreciation"
      description="Are you sure you want to run depreciation? This will create entries and update asset values."
      confirmText="Run"
      variant="destructive"
    />
    </>
  );
};

export default DepreciationRun;
