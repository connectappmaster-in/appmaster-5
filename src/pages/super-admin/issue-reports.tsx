import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, AlertCircle, Eye, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface IssueReport {
  id: string;
  user_id: string | null;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  email: string;
  phone: string | null;
  created_at: string;
}

const IssueReports = () => {
  const [reports, setReports] = useState<IssueReport[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('issue_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports((data || []) as IssueReport[]);
    } catch (error) {
      console.error('Error fetching issue reports:', error);
      toast({
        title: "Error",
        description: "Failed to load issue reports.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const updateStatus = async (id: string, status: 'in_progress' | 'resolved' | 'closed') => {
    try {
      const { error } = await supabase
        .from('issue_reports')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `Issue marked as ${status.replace('_', ' ')}.`,
      });

      fetchReports();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
      low: { variant: "secondary" },
      medium: { variant: "default" },
      high: { variant: "outline", className: "border-orange-500 text-orange-500" },
      critical: { variant: "destructive" },
    };

    const config = variants[priority] || variants.medium;

    return (
      <Badge variant={config.variant} className={config.className}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      open: "default",
      in_progress: "secondary",
      resolved: "outline",
      closed: "outline",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Issue Reports</h2>
        <p className="text-muted-foreground">Manage and track reported issues</p>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No issue reports yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="flex items-center gap-2 flex-wrap">
                      <AlertCircle className="w-5 h-5" />
                      {report.title}
                      {getPriorityBadge(report.priority)}
                      {getStatusBadge(report.status)}
                    </CardTitle>
                    <CardDescription>
                      Submitted on {format(new Date(report.created_at), 'PPpp')}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {report.status === 'open' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(report.id, 'in_progress')}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Start Work
                      </Button>
                    )}
                    {report.status === 'in_progress' && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(report.id, 'resolved')}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Mark Resolved
                      </Button>
                    )}
                    {report.status === 'resolved' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(report.id, 'closed')}
                      >
                        Close Issue
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a
                      href={`mailto:${report.email}`}
                      className="text-primary hover:underline"
                    >
                      {report.email}
                    </a>
                  </div>
                  {report.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a
                        href={`tel:${report.phone}`}
                        className="text-primary hover:underline"
                      >
                        {report.phone}
                      </a>
                    </div>
                  )}
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">Description:</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {report.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default IssueReports;