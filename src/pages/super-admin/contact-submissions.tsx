import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MessageSquare, Eye, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: 'new' | 'read' | 'responded';
  created_at: string;
}
const ContactSubmissions = () => {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  const fetchSubmissions = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('contact_submissions').select('*').order('created_at', {
        ascending: false
      });
      if (error) throw error;
      setSubmissions((data || []) as ContactSubmission[]);
    } catch (error) {
      console.error('Error fetching contact submissions:', error);
      toast({
        title: "Error",
        description: "Failed to load contact submissions.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchSubmissions();
  }, []);
  const updateStatus = async (id: string, status: 'read' | 'responded') => {
    try {
      const {
        error
      } = await supabase.from('contact_submissions').update({
        status
      }).eq('id', id);
      if (error) throw error;
      toast({
        title: "Status updated",
        description: `Submission marked as ${status}.`
      });
      fetchSubmissions();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive"
      });
    }
  };
  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      new: "default",
      read: "secondary",
      responded: "outline"
    };
    return <Badge variant={variants[status] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>;
  };
  if (loading) {
    return <div className="p-4">Loading...</div>;
  }
  return <div className="space-y-4">
      <div>
        
        
      </div>

      {submissions.length === 0 ? <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No contact submissions yet.
            </p>
          </CardContent>
        </Card> : <div className="grid gap-4">
          {submissions.map(submission => <Card key={submission.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      {submission.name}
                      {getStatusBadge(submission.status)}
                    </CardTitle>
                    <CardDescription>
                      Submitted on {format(new Date(submission.created_at), 'PPpp')}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {submission.status === 'new' && <Button size="sm" variant="outline" onClick={() => updateStatus(submission.id, 'read')}>
                        <Eye className="w-4 h-4 mr-2" />
                        Mark Read
                      </Button>}
                    {submission.status !== 'responded' && <Button size="sm" onClick={() => updateStatus(submission.id, 'responded')}>
                        <Check className="w-4 h-4 mr-2" />
                        Mark Responded
                      </Button>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a href={`mailto:${submission.email}`} className="text-primary hover:underline">
                      {submission.email}
                    </a>
                  </div>
                  {submission.phone && <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a href={`tel:${submission.phone}`} className="text-primary hover:underline">
                        {submission.phone}
                      </a>
                    </div>}
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">Message:</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {submission.message}
                  </p>
                </div>
              </CardContent>
            </Card>)}
        </div>}
    </div>;
};
export default ContactSubmissions;