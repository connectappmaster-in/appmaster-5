import { AssetTopBar } from "@/components/ITAM/AssetTopBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Package, Calendar, ClipboardCheck, AlertTriangle, Activity, ShieldCheck, BarChart3 } from "lucide-react";
import { useAssetReports } from "@/hooks/useAssetReports";
import { generateCSV, downloadCSV, formatCurrency, formatDate } from "@/lib/reportUtils";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
const AssetReports = () => {
  const {
    data: reportData,
    isLoading
  } = useAssetReports();
  const generateAssetInventoryReport = () => {
    if (!reportData?.assets.length) {
      toast.error("No assets found to generate report");
      return;
    }
    const headers = ["Name", "Asset Type", "Status", "Purchase Date", "Purchase Price", "Current Value"];
    const data = reportData.assets.map(asset => ({
      Name: asset.name,
      "Asset Type": asset.asset_type || "N/A",
      Status: asset.status || "N/A",
      "Purchase Date": formatDate(asset.purchase_date),
      "Purchase Price": formatCurrency(asset.purchase_price),
      "Current Value": formatCurrency(asset.current_value)
    }));
    const csv = generateCSV(data, headers);
    downloadCSV(csv, "asset_inventory_report");
    toast.success("Asset Inventory Report downloaded successfully");
  };
  const generateAssignmentHistoryReport = () => {
    if (!reportData?.assignments.length) {
      toast.error("No assignment records found");
      return;
    }
    const headers = ["Asset Name", "Assigned To", "Assigned At", "Returned At", "Condition"];
    const data = reportData.assignments.map(assignment => ({
      "Asset Name": assignment.assets?.name || "N/A",
      "Assigned To": assignment.assigned_to,
      "Assigned At": formatDate(assignment.assigned_at),
      "Returned At": assignment.returned_at ? formatDate(assignment.returned_at) : "Still Assigned",
      Condition: assignment.condition_at_assignment || "N/A"
    }));
    const csv = generateCSV(data, headers);
    downloadCSV(csv, "assignment_history_report");
    toast.success("Assignment History Report downloaded successfully");
  };
  const generateWarrantyExpiryReport = () => {
    if (!reportData?.warranties.length) {
      toast.error("No warranty records found");
      return;
    }
    const headers = ["Asset ID", "Warranty Start", "Warranty End", "AMC Start", "AMC End", "Notes"];
    const data = reportData.warranties.map(warranty => ({
      "Asset ID": warranty.asset_id,
      "Warranty Start": formatDate(warranty.warranty_start),
      "Warranty End": formatDate(warranty.warranty_end),
      "AMC Start": formatDate(warranty.amc_start),
      "AMC End": formatDate(warranty.amc_end),
      Notes: warranty.notes || "N/A"
    }));
    const csv = generateCSV(data, headers);
    downloadCSV(csv, "warranty_expiry_report");
    toast.success("Warranty Expiry Report downloaded successfully");
  };
  const generateDepreciationReport = () => {
    if (!reportData?.depreciation.length) {
      toast.error("No depreciation records found");
      return;
    }
    const headers = ["Asset ID", "Period Start", "Period End", "Depreciation Amount", "Accumulated Depreciation", "Book Value", "Entry Type"];
    const data = reportData.depreciation.map(entry => ({
      "Asset ID": entry.asset_id,
      "Period Start": formatDate(entry.period_start),
      "Period End": formatDate(entry.period_end),
      "Depreciation Amount": formatCurrency(entry.depreciation_amount),
      "Accumulated Depreciation": formatCurrency(entry.accumulated_depreciation),
      "Book Value": formatCurrency(entry.book_value),
      "Entry Type": entry.entry_type
    }));
    const csv = generateCSV(data, headers);
    downloadCSV(csv, "depreciation_report");
    toast.success("Depreciation Report downloaded successfully");
  };
  const generateAssetStatusReport = () => {
    if (!reportData?.assets.length) {
      toast.error("No assets found");
      return;
    }
    const statusSummary = reportData.assets.reduce((acc, asset) => {
      const status = asset.status || "unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const headers = ["Status", "Count"];
    const data = Object.entries(statusSummary).map(([status, count]) => ({
      Status: status,
      Count: count
    }));
    const csv = generateCSV(data, headers);
    downloadCSV(csv, "asset_status_report");
    toast.success("Asset Status Report downloaded successfully");
  };
  const generateLicenseExpiryReport = () => {
    if (!reportData?.licenses.length) {
      toast.error("No licenses found");
      return;
    }
    const headers = ["License Name", "Software Name", "Expiry Date", "Status", "Seats Total", "Seats Used"];
    const data = reportData.licenses.map(license => ({
      "License Name": license.name,
      "Software Name": license.software_name,
      "Expiry Date": formatDate(license.expiry_date),
      Status: license.status || "N/A",
      "Seats Total": license.seats_total,
      "Seats Used": license.seats_used
    }));
    const csv = generateCSV(data, headers);
    downloadCSV(csv, "license_expiry_report");
    toast.success("License Expiry Report downloaded successfully");
  };
  const generateAssetTypeReport = () => {
    if (!reportData?.assets.length) {
      toast.error("No assets found");
      return;
    }
    const typeSummary = reportData.assets.reduce((acc, asset) => {
      const type = asset.asset_type || "Uncategorized";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const headers = ["Asset Type", "Count"];
    const data = Object.entries(typeSummary).map(([type, count]) => ({
      "Asset Type": type,
      Count: count
    }));
    const csv = generateCSV(data, headers);
    downloadCSV(csv, "asset_type_report");
    toast.success("Asset Type Report downloaded successfully");
  };
  const generateMaintenanceHistoryReport = () => {
    if (!reportData?.maintenance.length) {
      toast.error("No maintenance records found");
      return;
    }
    const headers = ["Asset ID", "Issue Description", "Cost", "Status", "Created At", "Resolved At", "Notes"];
    const data = reportData.maintenance.map(record => ({
      "Asset ID": record.asset_id,
      "Issue Description": record.issue_description,
      Cost: formatCurrency(record.cost),
      Status: record.status || "N/A",
      "Created At": formatDate(record.created_at),
      "Resolved At": formatDate(record.resolved_at),
      Notes: record.notes || "N/A"
    }));
    const csv = generateCSV(data, headers);
    downloadCSV(csv, "maintenance_history_report");
    toast.success("Maintenance History Report downloaded successfully");
  };
  const reports = [{
    title: "Asset Inventory Report",
    description: "Complete list of all assets with details",
    icon: Package,
    action: generateAssetInventoryReport,
    count: reportData?.assets.length || 0
  }, {
    title: "Assignment History",
    description: "Historical record of asset assignments",
    icon: FileText,
    action: generateAssignmentHistoryReport,
    count: reportData?.assignments.length || 0
  }, {
    title: "Warranty Expiry Report",
    description: "Assets with expiring warranties",
    icon: ShieldCheck,
    action: generateWarrantyExpiryReport,
    count: reportData?.warranties.length || 0
  }, {
    title: "Depreciation Report",
    description: "Asset depreciation calculations",
    icon: BarChart3,
    action: generateDepreciationReport,
    count: reportData?.depreciation.length || 0
  }, {
    title: "Asset Status Report",
    description: "Summary of assets by current status",
    icon: Activity,
    action: generateAssetStatusReport,
    count: reportData?.assets.length || 0
  }, {
    title: "License Expiry Report",
    description: "Software licenses approaching expiration",
    icon: Calendar,
    action: generateLicenseExpiryReport,
    count: reportData?.licenses.length || 0
  }, {
    title: "Asset Type Report",
    description: "Assets categorized by type",
    icon: ClipboardCheck,
    action: generateAssetTypeReport,
    count: reportData?.assets.length || 0
  }, {
    title: "Maintenance History",
    description: "Complete maintenance and repair records",
    icon: AlertTriangle,
    action: generateMaintenanceHistoryReport,
    count: reportData?.maintenance.length || 0
  }];
  return <div className="min-h-screen bg-background">
      <AssetTopBar />
      
      <div className="px-4 py-3 space-y-3">
        {isLoading ? <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {reports.map(report => <Card key={report.title} className="p-3 hover:shadow-md transition-shadow border hover:border-primary/50">
                <div className="flex items-start justify-between mb-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <report.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {report.count} records
                  </div>
                </div>
                <h3 className="font-semibold text-sm mb-1.5">{report.title}</h3>
                <p className="text-xs text-muted-foreground mb-2.5 line-clamp-2">{report.description}</p>
                <Button size="sm" variant="outline" className="w-full h-7 text-xs" onClick={report.action} disabled={report.count === 0}>
                  <Download className="h-3 w-3 mr-1.5" />
                  Generate Report
                </Button>
              </Card>)}
          </div>}
      </div>
    </div>;
};
export default AssetReports;