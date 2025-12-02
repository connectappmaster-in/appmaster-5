import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganisation } from "@/contexts/OrganisationContext";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, TrendingDown, Package, FileText } from "lucide-react";
import { format } from "date-fns";

const DepreciationReports = () => {
  const { organisation } = useOrganisation();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [groupBy, setGroupBy] = useState("asset");

  const { data: entries = [] } = useQuery({
    queryKey: ["depreciation-entries-report", organisation?.id, startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from("depreciation_entries")
        .select("*")
        .eq("posted", true)
        .order("period_end", { ascending: false });

      if (startDate) {
        query = query.gte("period_start", startDate);
      }
      if (endDate) {
        query = query.lte("period_end", endDate);
      }

      const { data } = await query;
      return data || [];
    },
  });

  const totalDepreciation = entries.reduce((sum, e) => sum + (parseFloat(String(e.depreciation_amount)) || 0), 0);
  const totalAccumulated = entries.length > 0 
    ? Math.max(...entries.map(e => parseFloat(String(e.accumulated_depreciation)) || 0))
    : 0;

  const handleExport = () => {
    const headers = ["Asset", "Asset Tag", "Period", "Depreciation", "Accumulated", "Book Value", "Method"];
    const csvData = entries.map((entry) => [
      "Asset " + entry.asset_id,
      "",
      `${entry.period_start} to ${entry.period_end}`,
      entry.depreciation_amount,
      entry.accumulated_depreciation,
      entry.book_value,
      "",
    ]);

    const csv = [headers, ...csvData].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `depreciation-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-2xl font-bold">Depreciation Reports</h1>
              <p className="text-sm text-muted-foreground">
                Analyze depreciation across periods and assets
              </p>
            </div>
          </div>
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Depreciation</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">INR {totalDepreciation.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">In selected period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assets</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(entries.map(e => e.asset_id)).size}
              </div>
              <p className="text-xs text-muted-foreground">Being depreciated</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="group_by">Group By</Label>
                <Select value={groupBy} onValueChange={setGroupBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asset">Asset</SelectItem>
                    <SelectItem value="period">Period</SelectItem>
                    <SelectItem value="method">Method</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Depreciation Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Depreciation</TableHead>
                  <TableHead className="text-right">Accumulated</TableHead>
                  <TableHead className="text-right">Book Value</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                        <p className="text-sm text-muted-foreground">
                          No entries found for selected period
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">Asset ID: {entry.asset_id}</p>
                          <p className="text-xs text-muted-foreground">—</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(entry.period_start), "MMM yyyy")}
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
                        <Badge variant={entry.entry_type === "normal" ? "default" : "secondary"}>
                          {entry.entry_type}
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

export default DepreciationReports;
