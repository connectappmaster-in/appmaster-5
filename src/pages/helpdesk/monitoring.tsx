import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Server, Database, Globe, Cpu, HardDrive } from "lucide-react";

export default function Monitoring() {
  const metrics = [
    { label: "Server Status", value: "Online", icon: Server, status: "success" },
    { label: "Database", value: "Healthy", icon: Database, status: "success" },
    { label: "API Latency", value: "45ms", icon: Globe, status: "success" },
    { label: "CPU Usage", value: "23%", icon: Cpu, status: "success" },
    { label: "Memory", value: "67%", icon: HardDrive, status: "warning" },
    { label: "Disk Space", value: "42%", icon: HardDrive, status: "success" }
  ];

  return (
    <div className="max-w-7xl space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const statusColor = metric.status === 'success' ? 'text-green-500' : 'text-orange-500';
          
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                <Icon className={`h-5 w-5 ${statusColor}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['Ticketing System', 'Asset Management', 'Knowledge Base', 'Email Service'].map((service) => (
              <div key={service} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-green-500" />
                  <span className="font-medium">{service}</span>
                </div>
                <span className="text-sm text-green-500">Operational</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}