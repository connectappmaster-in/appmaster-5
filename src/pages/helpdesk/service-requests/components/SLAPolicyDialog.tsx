import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface SLAPolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy?: any;
}

export function SLAPolicyDialog({ open, onOpenChange, policy }: SLAPolicyDialogProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      priority: policy?.priority || "medium",
      response_time_minutes: policy?.response_time_minutes || 60,
      fulfillment_time_minutes: policy?.fulfillment_time_minutes || 480,
    },
  });

  const priority = watch("priority");

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (policy) {
        const { error } = await supabase
          .from("srm_sla_policies")
          .update(data)
          .eq("id", policy.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("srm_sla_policies")
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["srm-sla-policies"] });
      toast.success(policy ? "SLA policy updated" : "SLA policy created");
      onOpenChange(false);
      reset();
    },
    onError: () => {
      toast.error("Failed to save SLA policy");
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{policy ? "Edit" : "Create"} SLA Policy</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="priority">Priority Level</Label>
            <Select value={priority} onValueChange={(value) => setValue("priority", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="response_time_minutes">Response Time (minutes)</Label>
            <Input
              id="response_time_minutes"
              type="number"
              {...register("response_time_minutes", { valueAsNumber: true })}
              required
            />
            <p className="text-xs text-muted-foreground">
              Time to first response after request creation
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fulfillment_time_minutes">Fulfillment Time (minutes)</Label>
            <Input
              id="fulfillment_time_minutes"
              type="number"
              {...register("fulfillment_time_minutes", { valueAsNumber: true })}
              required
            />
            <p className="text-xs text-muted-foreground">
              Time to complete the service request
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save Policy"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
