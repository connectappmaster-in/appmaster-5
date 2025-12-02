import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface UpdateDetail {
  kb_number: string;
  title: string;
  classification: string;
  severity: string;
  release_date: string;
  restart_required: boolean;
  download_size_mb: number;
}

interface AffectedDevice {
  device_id: number;
  device_name: string;
  status: string;
  detected_at: string;
  device_uuid: string;
  os_version: string;
}

export default function UpdateDetailPage() {
  const { kbNumber } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updateDetail, setUpdateDetail] = useState<UpdateDetail | null>(null);
  const [affectedDevices, setAffectedDevices] = useState<AffectedDevice[]>([]);
  const [installedDevices, setInstalledDevices] = useState<AffectedDevice[]>([]);

  useEffect(() => {
    fetchUpdateDetails();
  }, [kbNumber]);

  const fetchUpdateDetails = async () => {
    try {
      setLoading(true);

      // Fetch update details from pending updates
      const { data: pendingData } = await supabase
        .from("system_pending_updates")
        .select(`
          kb_number,
          title,
          classification,
          severity,
          release_date,
          restart_required,
          download_size_mb,
          detected_at,
          device_id,
          system_devices!inner(device_name, device_uuid, os_version)
        `)
        .eq("kb_number", kbNumber)
        .eq("is_deleted", false);

      if (pendingData && pendingData.length > 0) {
        const first = pendingData[0];
        setUpdateDetail({
          kb_number: first.kb_number,
          title: first.title,
          classification: first.classification,
          severity: first.severity,
          release_date: first.release_date,
          restart_required: first.restart_required,
          download_size_mb: first.download_size_mb,
        });

        setAffectedDevices(
          pendingData.map((item: any) => ({
            device_id: item.device_id,
            device_name: item.system_devices.device_name,
            device_uuid: item.system_devices.device_uuid,
            os_version: item.system_devices.os_version,
            status: "pending",
            detected_at: item.detected_at,
          }))
        );
      }

      // Fetch installed devices
      const { data: installedData } = await supabase
        .from("system_installed_updates")
        .select(`
          kb_number,
          title,
          install_date,
          status,
          device_id,
          system_devices!inner(device_name, device_uuid, os_version)
        `)
        .eq("kb_number", kbNumber);

      if (installedData) {
        if (!updateDetail && installedData.length > 0) {
          const first = installedData[0];
          setUpdateDetail({
            kb_number: first.kb_number,
            title: first.title,
            classification: "N/A",
            severity: "N/A",
            release_date: "N/A",
            restart_required: false,
            download_size_mb: 0,
          });
        }

        setInstalledDevices(
          installedData.map((item: any) => ({
            device_id: item.device_id,
            device_name: item.system_devices.device_name,
            device_uuid: item.system_devices.device_uuid,
            os_version: item.system_devices.os_version,
            status: item.status,
            detected_at: item.install_date,
          }))
        );
      }
    } catch (error: any) {
      console.error("Error fetching update details:", error);
      toast.error("Failed to load update details");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "destructive";
      case "important":
        return "default";
      case "moderate":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Loading update details...</div>
      </div>
    );
  }

  if (!updateDetail) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Update not found</p>
          <Button onClick={() => navigate("/helpdesk/system-updates/updates")} className="mt-4">
            Back to Updates
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/helpdesk/system-updates/updates")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{updateDetail.kb_number}</h1>
            <p className="text-sm text-muted-foreground">{updateDetail.title}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Classification</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline">{updateDetail.classification}</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Severity</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={getSeverityColor(updateDetail.severity)}>
                {updateDetail.severity}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Release Date</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">
                {new Date(updateDetail.release_date).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Update Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Restart Required</p>
                <p className="text-sm font-medium text-foreground">
                  {updateDetail.restart_required ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Download Size</p>
                <p className="text-sm font-medium text-foreground">
                  {updateDetail.download_size_mb} MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Affected Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending">
              <TabsList>
                <TabsTrigger value="pending">
                  Pending ({affectedDevices.length})
                </TabsTrigger>
                <TabsTrigger value="installed">
                  Installed ({installedDevices.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Device Name</TableHead>
                      <TableHead>OS Version</TableHead>
                      <TableHead>Detected At</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {affectedDevices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No pending devices
                        </TableCell>
                      </TableRow>
                    ) : (
                      affectedDevices.map((device) => (
                        <TableRow
                          key={device.device_id}
                          className="cursor-pointer hover:bg-accent"
                          onClick={() =>
                            navigate(`/helpdesk/system-updates/device-detail/${device.device_id}`)
                          }
                        >
                          <TableCell className="font-medium">{device.device_name}</TableCell>
                          <TableCell>{device.os_version}</TableCell>
                          <TableCell>
                            {new Date(device.detected_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="installed">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Device Name</TableHead>
                      <TableHead>OS Version</TableHead>
                      <TableHead>Installed At</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {installedDevices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No installed devices
                        </TableCell>
                      </TableRow>
                    ) : (
                      installedDevices.map((device) => (
                        <TableRow
                          key={device.device_id}
                          className="cursor-pointer hover:bg-accent"
                          onClick={() =>
                            navigate(`/helpdesk/system-updates/device-detail/${device.device_id}`)
                          }
                        >
                          <TableCell className="font-medium">{device.device_name}</TableCell>
                          <TableCell>{device.os_version}</TableCell>
                          <TableCell>
                            {new Date(device.detected_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="default">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {device.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
