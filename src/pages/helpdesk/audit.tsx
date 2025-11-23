import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download, Filter } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Audit() {
  const auditLogs = [
    {
      id: 1,
      user: "John Doe",
      action: "Created Ticket",
      module: "Tickets",
      timestamp: "2024-01-15 14:30:00",
      ip: "192.168.1.100"
    },
    {
      id: 2,
      user: "Jane Smith",
      action: "Updated Asset",
      module: "Assets",
      timestamp: "2024-01-15 14:25:00",
      ip: "192.168.1.101"
    },
    {
      id: 3,
      user: "Admin User",
      action: "Modified Settings",
      module: "Settings",
      timestamp: "2024-01-15 14:20:00",
      ip: "192.168.1.102"
    }
  ];

  return (
    <div className="max-w-7xl space-y-6">
      <div className="flex items-center justify-end gap-2 mb-6">
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search audit logs..."
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.user}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.module}</TableCell>
                  <TableCell>{log.timestamp}</TableCell>
                  <TableCell>{log.ip}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}