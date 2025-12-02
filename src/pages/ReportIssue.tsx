import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BackButton } from "@/components/BackButton";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const ReportIssue = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    email: "",
    phone: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from("issue_reports").insert({
        user_id: user?.id || null,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        email: formData.email || user?.email,
        phone: formData.phone,
      });

      if (error) throw error;

      toast({
        title: "Issue Reported Successfully",
        description: "We've received your report and will look into it shortly.",
      });

      setFormData({
        title: "",
        description: "",
        priority: "medium",
        email: "",
        phone: "",
      });
    } catch (error) {
      console.error("Error submitting issue:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your issue. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        
        <div className="max-w-2xl mx-auto mt-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Report an Issue</h1>
            <p className="text-muted-foreground">
              Found a bug or experiencing problems? Let us know and we'll fix it.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="space-y-2">
              <Label htmlFor="title">Issue Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Brief description of the issue"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Please describe the issue in detail, including steps to reproduce if applicable..."
                className="min-h-[150px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => handleChange("priority", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Minor issue</SelectItem>
                  <SelectItem value="medium">Medium - Affects functionality</SelectItem>
                  <SelectItem value="high">High - Significant impact</SelectItem>
                  <SelectItem value="critical">Critical - System down</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Issue Report"}
            </Button>
          </form>

          <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">What happens next?</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Our team will review your report</li>
                  <li>We'll investigate and prioritize the issue</li>
                  <li>You'll receive updates via email</li>
                  <li>We'll notify you when it's resolved</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportIssue;