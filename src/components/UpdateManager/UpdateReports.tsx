import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Download, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { useUpdateDevices, useUpdateStats } from "@/hooks/useUpdateManager";
import { format, startOfMonth, subMonths } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export const UpdateReports = () => {
  const { data: devices, isLoading: devicesLoading } = useUpdateDevices();
  const { data: stats, isLoading: statsLoading } = useUpdateStats();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));

  const isLoading = devicesLoading || statsLoading;

  // Generate last 6 months for selection
  const monthOptions = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: format(date, "yyyy-MM"),
      label: format(date, "MMMM yyyy"),
    };
  });

  const exportReport = () => {
    if (!devices) return;

    const csvContent = [
      ["Device Name", "Asset Tag", "Type", "Owner", "Location", "Status", "Manual Completion", "Last Check"].join(","),
      ...devices.map((d) =>
        [
          d.device_name,
          d.asset_tag || "",
          d.device_type,
          d.owner_name || "",
          d.location || "",
          d.is_completed_this_month ? "Completed (Manual)" : d.update_status,
          d.is_completed_this_month ? "Yes" : "No",
          d.last_update_check ? format(new Date(d.last_update_check), "yyyy-MM-dd HH:mm") : "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `update-compliance-${selectedMonth}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const compliantCount = devices?.filter((d) => d.update_status === "up_to_date" || d.is_completed_this_month).length || 0;
  const manualCount = devices?.filter((d) => d.is_completed_this_month).length || 0;
  const pendingCount = devices?.filter((d) => d.update_status === "pending" && !d.is_completed_this_month).length || 0;
  const failedCount = devices?.filter((d) => d.update_status === "failed" && !d.is_completed_this_month).length || 0;
  const totalCount = devices?.length || 0;

  // Group by department for breakdown
  const departmentBreakdown = devices?.reduce((acc, d) => {
    const dept = d.department || "Unassigned";
    if (!acc[dept]) {
      acc[dept] = { total: 0, compliant: 0, manual: 0 };
    }
    acc[dept].total++;
    if (d.update_status === "up_to_date" || d.is_completed_this_month) {
      acc[dept].compliant++;
    }
    if (d.is_completed_this_month) {
      acc[dept].manual++;
    }
    return acc;
  }, {} as Record<string, { total: number; compliant: number; manual: number }>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={exportReport} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{totalCount}</span>
            </div>
            <p className="text-sm text-muted-foreground">Total Devices</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{compliantCount}</span>
            </div>
            <p className="text-sm text-muted-foreground">Compliant</p>
            <p className="text-xs text-muted-foreground mt-1">
              ({manualCount} manual)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <span className="text-2xl font-bold text-yellow-600">{pendingCount}</span>
            </div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="text-2xl font-bold text-red-600">{failedCount}</span>
            </div>
            <p className="text-sm text-muted-foreground">Failed</p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Overall Compliance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{compliantCount} of {totalCount} devices</span>
              <span className="font-medium">{stats?.complianceRate || 0}%</span>
            </div>
            <Progress value={stats?.complianceRate || 0} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Department Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Compliance by Department</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-center">Compliant</TableHead>
                <TableHead className="text-center">Manual</TableHead>
                <TableHead className="text-center">Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(departmentBreakdown || {}).map(([dept, data]) => {
                const rate = Math.round((data.compliant / data.total) * 100);
                return (
                  <TableRow key={dept}>
                    <TableCell className="font-medium">{dept}</TableCell>
                    <TableCell className="text-center">{data.total}</TableCell>
                    <TableCell className="text-center">{data.compliant}</TableCell>
                    <TableCell className="text-center">
                      {data.manual > 0 && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {data.manual}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={rate >= 90 ? "default" : rate >= 70 ? "secondary" : "destructive"}
                      >
                        {rate}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Manual Completions List */}
      {manualCount > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              Manual Completions This Month
              <Badge variant="outline">{manualCount}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead>Asset Tag</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Department</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices
                  ?.filter((d) => d.is_completed_this_month)
                  .map((device) => (
                    <TableRow key={device.id}>
                      <TableCell className="font-medium">{device.device_name}</TableCell>
                      <TableCell>{device.asset_tag || "—"}</TableCell>
                      <TableCell>{device.owner_name || "—"}</TableCell>
                      <TableCell>{device.department || "—"}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
