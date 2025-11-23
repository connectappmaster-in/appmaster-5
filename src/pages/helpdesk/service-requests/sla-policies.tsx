import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";
import { SLAPolicyDialog } from "./components/SLAPolicyDialog";

const priorityColors: Record<string, string> = {
  urgent: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-blue-500",
};

export default function SLAPolicies() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: policies, isLoading } = useQuery({
    queryKey: ["srm-sla-policies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("srm_sla_policies")
        .select("*")
        .order("priority", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("srm_sla_policies")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["srm-sla-policies"] });
      toast.success("SLA policy deleted");
    },
    onError: () => {
      toast.error("Failed to delete SLA policy");
    },
  });

  const handleEdit = (policy: any) => {
    setSelectedPolicy(policy);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setSelectedPolicy(null);
    setDialogOpen(true);
  };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="min-h-screen bg-background">
      <BackButton />
      <div className="container mx-auto py-4 px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">SLA Policies</h1>
            <p className="text-muted-foreground">Configure service level agreements for requests</p>
          </div>
          <Button onClick={handleNew}>
            <Plus className="h-4 w-4 mr-2" />
            New Policy
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : !policies || policies.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No SLA policies configured</p>
              <Button onClick={handleNew}>Create First Policy</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {policies.map((policy) => (
              <Card key={policy.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={priorityColors[policy.priority] || "bg-gray-500"}>
                        {policy.priority}
                      </Badge>
                      <CardTitle className="text-lg">Priority SLA</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(policy)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => deleteMutation.mutate(policy.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Response Time</p>
                        <p className="font-semibold">
                          {formatMinutes(policy.response_time_minutes)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Fulfillment Time</p>
                        <p className="font-semibold">
                          {formatMinutes(policy.fulfillment_time_minutes)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <SLAPolicyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        policy={selectedPolicy}
      />
    </div>
  );
}
