import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FileText } from "lucide-react";
import { FormattedDate } from "@/components/FormattedDate";

interface AuditLog {
  id: string;
  action_type: string;
  entity_type: string | null;
  entity_id: string | null;
  user_id: string | null;
  metadata: any;
  created_at: string;
}

export const OrgAuditLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [user]);

  const fetchLogs = async () => {
    if (!user) return;

    try {
      // Get user's organization
      const { data: userData } = await supabase
        .from("users")
        .select("organisation_id")
        .eq("auth_user_id", user.id)
        .single();

      if (!userData) return;

      // Fetch audit logs for this organization
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("organisation_id", userData.organisation_id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(log.metadata).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterAction === "all" || log.action_type === filterAction;

    return matchesSearch && matchesFilter;
  });

  const uniqueActions = Array.from(new Set(logs.map((log) => log.action_type)));

  const getActionBadgeVariant = (action: string) => {
    if (action.includes("create") || action.includes("signup")) return "default";
    if (action.includes("update") || action.includes("change")) return "secondary";
    if (action.includes("delete") || action.includes("remove")) return "destructive";
    return "outline";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {uniqueActions.map((action) => (
              <SelectItem key={action} value={action}>
                {action}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No audit logs found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">
                    <FormattedDate 
                      date={log.created_at} 
                      options={{ 
                        year: 'numeric', 
                        month: 'short', 
                        day: '2-digit', 
                        hour: '2-digit', 
                        minute: '2-digit', 
                        second: '2-digit' 
                      }} 
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant={getActionBadgeVariant(log.action_type)}>
                      {log.action_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {log.entity_type || "-"}
                  </TableCell>
                  <TableCell className="max-w-md">
                    <div className="text-sm truncate">
                      {log.metadata && typeof log.metadata === "object" ? (
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {JSON.stringify(log.metadata)}
                        </code>
                      ) : (
                        "-"
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground text-center">
        Showing {filteredLogs.length} of {logs.length} audit logs
      </div>
    </div>
  );
};
