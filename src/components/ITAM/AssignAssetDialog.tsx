import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

const assignSchema = z.object({
  assigned_to: z.string().min(1, "Please select a user"),
  condition_at_assignment: z.string().optional(),
  notes: z.string().optional(),
});

interface AssignAssetDialogProps {
  asset: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AssignAssetDialog = ({ asset, open, onOpenChange }: AssignAssetDialogProps) => {
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof assignSchema>>({
    resolver: zodResolver(assignSchema),
    defaultValues: {
      assigned_to: "",
      condition_at_assignment: "good",
      notes: "",
    },
  });

  // Fetch users for assignment
  const { data: users = [] } = useQuery({
    queryKey: ["org-users"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: userData } = await supabase
        .from("users")
        .select("organisation_id")
        .eq("auth_user_id", user.id)
        .single();

      if (!userData?.organisation_id) return [];

      const { data, error } = await supabase
        .from("users")
        .select("id, name, email")
        .eq("organisation_id", userData.organisation_id)
        .eq("status", "active")
        .order("name");

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const assignAsset = useMutation({
    mutationFn: async (values: z.infer<typeof assignSchema>) => {
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

      const assignmentData = {
        asset_id: asset.id,
        assigned_to: values.assigned_to,
        assigned_by: userData?.id,
        condition_at_assignment: values.condition_at_assignment,
        notes: values.notes,
        organisation_id: userData?.organisation_id,
        tenant_id: profileData?.tenant_id || 1,
      };

      const { data, error } = await supabase
        .from("asset_assignments")
        .insert(assignmentData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Asset assigned successfully");
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["itam-stats"] });
      queryClient.invalidateQueries({ queryKey: ["asset-assignments"] });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to assign asset: " + error.message);
    },
  });

  const onSubmit = (values: z.infer<typeof assignSchema>) => {
    assignAsset.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Asset: {asset?.name}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="assigned_to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign To *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="condition_at_assignment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional notes about this assignment..."
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={assignAsset.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={assignAsset.isPending}>
                {assignAsset.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Assign Asset
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
