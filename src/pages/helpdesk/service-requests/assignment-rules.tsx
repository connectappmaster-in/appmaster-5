import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AssignmentRuleDialog } from "./components/AssignmentRuleDialog";

export default function AssignmentRules() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: rules, isLoading } = useQuery({
    queryKey: ["srm-assignment-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("srm_assignment_rules")
        .select("*")
        .order("priority", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("srm_assignment_rules")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["srm-assignment-rules"] });
      toast.success("Assignment rule deleted");
    },
    onError: () => {
      toast.error("Failed to delete assignment rule");
    },
  });

  const handleEdit = (rule: any) => {
    setSelectedRule(rule);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setSelectedRule(null);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <BackButton />
      <div className="container mx-auto py-4 px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Assignment Rules</h1>
            <p className="text-muted-foreground">Configure automatic routing for service requests</p>
          </div>
          <Button onClick={handleNew}>
            <Plus className="h-4 w-4 mr-2" />
            New Rule
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : !rules || rules.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No assignment rules configured</p>
              <Button onClick={handleNew}>Create First Rule</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {rules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{rule.name}</h3>
                        <Badge variant={rule.is_active ? "default" : "secondary"}>
                          {rule.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">Priority: {rule.priority}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">Assign to: {rule.assign_to || rule.assign_to_queue || "Not configured"}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Conditions: </span>
                          <span className="font-medium">
                            {rule.conditions ? JSON.stringify(rule.conditions).length : 0} configured
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Assignment: </span>
                          <span className="font-medium">
                            {rule.assign_to ? "User" : rule.assign_to_queue ? "Queue" : "Not set"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(rule)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => deleteMutation.mutate(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AssignmentRuleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        rule={selectedRule}
      />
    </div>
  );
}
