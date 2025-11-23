import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface AssignmentRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule?: any;
}

export function AssignmentRuleDialog({ open, onOpenChange, rule }: AssignmentRuleDialogProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      name: rule?.name || "",
      priority: rule?.priority || 1,
      is_active: rule?.is_active ?? true,
      assign_to: rule?.assign_to || "",
      assign_to_queue: rule?.assign_to_queue || "",
      conditions: rule?.conditions || {},
    },
  });

  const isActive = watch("is_active");

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (rule) {
        const { error } = await supabase
          .from("srm_assignment_rules")
          .update(data)
          .eq("id", rule.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("srm_assignment_rules")
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["srm-assignment-rules"] });
      toast.success(rule ? "Rule updated" : "Rule created");
      onOpenChange(false);
      reset();
    },
    onError: () => {
      toast.error("Failed to save rule");
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{rule ? "Edit" : "Create"} Assignment Rule</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Rule Name</Label>
            <Input id="name" {...register("name")} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assign_to">Assign To (User ID)</Label>
            <Input id="assign_to" {...register("assign_to")} placeholder="Optional: specific user ID" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assign_to_queue">Assign To Queue</Label>
            <Input id="assign_to_queue" {...register("assign_to_queue")} placeholder="Optional: queue name" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Input
                id="priority"
                type="number"
                {...register("priority", { valueAsNumber: true })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="is_active">Active</Label>
              <div className="flex items-center h-10">
                <Switch
                  id="is_active"
                  checked={isActive}
                  onCheckedChange={(checked) => setValue("is_active", checked)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save Rule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
