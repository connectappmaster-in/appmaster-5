import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Download, FileText, CheckCircle, XCircle, Clock } from "lucide-react";

const DepreciationLedger = () => {
  const { assetId } = useParams();
  const navigate = useNavigate();

  const { data: asset } = useQuery({
    queryKey: ["itam-asset-ledger", assetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("itam_assets")
        .select("*")
        .eq("id", parseInt(assetId || "0"))
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!assetId,
  });

  const { data: entries = [] } = useQuery({
    queryKey: ["depreciation-entries-ledger", assetId],
    queryFn: async () => {
      const { data } = await supabase
        .from("depreciation_entries")
        .select("*")
        .eq("asset_id", parseInt(assetId || "0"))
        .order("period_end", { ascending: true });
      return data || [];
    },
    enabled: !!assetId,
  });

  const { data: runLogs = [] } = useQuery({
    queryKey: ["depreciation-run-logs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("depreciation_run_logs")
        .select("*")
        .order("run_date", { ascending: false })
        .limit(10);
      return data || [];
    },
  });

  const handleExport = () => {
    const headers = ["Period Start", "Period End", "Depreciation", "Accumulated", "Book Value", "Type", "Posted"];
    const csvData = entries.map((entry) => [
      entry.period_start,
      entry.period_end,
      entry.depreciation_amount,
      entry.accumulated_depreciation,
      entry.book_value,
      entry.entry_type,
      entry.posted ? "Yes" : "No",
    ]);

    const csv = [headers, ...csvData].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `depreciation-ledger-${assetId}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-2xl font-bold">Depreciation Ledger</h1>
              <p className="text-sm text-muted-foreground">
                {asset?.name} ({asset?.asset_tag})
              </p>
            </div>
          </div>
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cost Basis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                INR {asset?.purchase_price?.toLocaleString() || "—"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Accumulated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                INR {asset?.accumulated_depreciation?.toLocaleString() || "0"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Book Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                INR {asset?.book_value?.toLocaleString() || asset?.purchase_price?.toLocaleString() || "—"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={asset?.depreciation_status === "active" ? "default" : "secondary"}>
                {asset?.depreciation_status || "Not Set"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ledger Entries ({entries.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period Start</TableHead>
                  <TableHead>Period End</TableHead>
                  <TableHead className="text-right">Depreciation</TableHead>
                  <TableHead className="text-right">Accumulated</TableHead>
                  <TableHead className="text-right">Book Value</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                        <p className="text-sm text-muted-foreground">No depreciation entries</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-sm">
                        {format(new Date(entry.period_start), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(entry.period_end), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        INR {Number(entry.depreciation_amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        INR {Number(entry.accumulated_depreciation).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        INR {Number(entry.book_value).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          entry.entry_type === "normal" ? "default" :
                          entry.entry_type === "adjustment" ? "secondary" :
                          "outline"
                        }>
                          {entry.entry_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {entry.posted ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {entry.notes || "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Run History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Run Date</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Entries</TableHead>
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
                      <TableCell className="text-right">{log.entries_created}</TableCell>
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
  );
};

const getStatusBadge = (status: string) => {
  const variants: Record<string, string> = {
    success: "bg-green-100 text-green-800",
    partial_success: "bg-yellow-100 text-yellow-800",
    failed: "bg-red-100 text-red-800",
  };
  return variants[status] || "bg-gray-100 text-gray-800";
};

export default DepreciationLedger;
