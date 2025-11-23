import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/BackButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function RequestForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const catalogId = searchParams.get("id");
  const [formData, setFormData] = useState<Record<string, any>>({});

  const { data: catalogItem, isLoading } = useQuery({
    queryKey: ["srm-catalog-item", catalogId],
    queryFn: async () => {
      if (!catalogId) throw new Error("No catalog ID provided");
      const { data, error } = await supabase
        .from("srm_catalog")
        .select("*")
        .eq("id", parseInt(catalogId))
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!catalogId,
  });

  const createRequest = useMutation({
    mutationFn: async (data: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: userData } = await supabase
        .from("users")
        .select("id, organisation_id")
        .eq("auth_user_id", user.id)
        .single();

      const { data: profileData } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", user.id)
        .maybeSingle();

      const tenantId = profileData?.tenant_id || 1;
      const requestNumber = `SRM-${Date.now().toString().slice(-6)}`;

      const { data: newRequest, error } = await supabase
        .from("srm_requests")
        .insert({
          request_number: requestNumber,
          catalog_item_id: parseInt(catalogId || "0"),
          requester_id: userData?.id,
          description: data.description || "",
          priority: data.priority || "medium",
          status: "pending",
          tenant_id: tenantId,
          organisation_id: userData?.organisation_id,
        })
        .select()
        .single();

      if (error) throw error;
      return newRequest;
    },
    onSuccess: (data) => {
      toast.success("Service request submitted successfully");
      navigate(`/helpdesk/service-requests/detail/${data.id}`);
    },
    onError: (error: any) => {
      toast.error("Failed to submit request: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRequest.mutate(formData);
  };

  const renderField = (field: any) => {
    const value = formData[field.name] || "";
    
    switch (field.type) {
      case "text":
      case "email":
      case "number":
        return (
          <Input
            type={field.type}
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            required={field.required}
          />
        );
      case "textarea":
        return (
          <Textarea
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            required={field.required}
            rows={4}
          />
        );
      case "select":
        return (
          <Select
            value={value}
            onValueChange={(val) => setFormData({ ...formData, [field.name]: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return <Input value={value} onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!catalogItem) {
    return (
      <div className="min-h-screen bg-background">
        <BackButton />
        <div className="container mx-auto py-8 px-4 max-w-3xl text-center">
          <p className="text-muted-foreground">Service not found</p>
        </div>
      </div>
    );
  }

  const requiredFields = Array.isArray(catalogItem.form_fields) 
    ? catalogItem.form_fields 
    : (typeof catalogItem.form_fields === 'object' && catalogItem.form_fields !== null)
    ? Object.values(catalogItem.form_fields)
    : [];

  return (
    <div className="min-h-screen bg-background">
      <BackButton />
      <div className="container mx-auto py-4 px-4 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>{catalogItem.name}</CardTitle>
            <CardDescription>{catalogItem.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {requiredFields.length > 0 && requiredFields.map((field: any) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  {renderField(field)}
                  {field.help && (
                    <p className="text-sm text-muted-foreground">{field.help}</p>
                  )}
                </div>
              ))}

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority || "medium"}
                  onValueChange={(val) => setFormData({ ...formData, priority: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additional_notes">Additional Notes</Label>
                <Textarea
                  id="additional_notes"
                  value={formData.additional_notes || ""}
                  onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
                  rows={4}
                  placeholder="Any additional information..."
                />
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createRequest.isPending}>
                  {createRequest.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Submit Request
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
