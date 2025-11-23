import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const requestSchema = z.object({
  additional_notes: z.string().optional(),
  form_data: z.record(z.string()).optional(),
});

interface CreateServiceRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: any;
}

export const CreateServiceRequestDialog = ({
  open,
  onOpenChange,
  service,
}: CreateServiceRequestDialogProps) => {
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
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

      return {
        userId: userData?.id,
        orgId: userData?.organisation_id,
        tenantId: profileData?.tenant_id || 1,
      };
    },
  });

  const form = useForm<z.infer<typeof requestSchema>>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      additional_notes: "",
      form_data: {},
    },
  });

  const createRequest = useMutation({
    mutationFn: async (values: z.infer<typeof requestSchema>) => {
      if (!currentUser || !service) throw new Error("User or service not found");

      const { data: requestNumber } = await supabase.rpc(
        "generate_srm_request_number",
        {
          p_tenant_id: currentUser.tenantId,
          p_org_id: currentUser.orgId,
        }
      );

      const requestData = {
        request_number: requestNumber,
        catalog_item_id: service.id,
        requester_id: currentUser.userId,
        assignee_id: service.auto_assign_to,
        organisation_id: currentUser.orgId,
        tenant_id: currentUser.tenantId,
        additional_notes: values.additional_notes,
        form_data: values.form_data || {},
        approval_required: service.requires_approval,
        status: service.requires_approval ? "pending" : "approved",
        priority: "medium",
      };

      const { data, error } = await supabase
        .from("srm_requests")
        .insert(requestData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Service request submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["srm-requests"] });
      queryClient.invalidateQueries({ queryKey: ["srm-stats"] });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to submit request: " + error.message);
    },
  });

  const onSubmit = (values: z.infer<typeof requestSchema>) => {
    createRequest.mutate(values);
  };

  if (!service) return null;

  const formFields = service.form_fields || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Request: {service.name}</DialogTitle>
          <DialogDescription>
            {service.description}
            {service.estimated_delivery_days && (
              <span className="block mt-2">
                Estimated delivery: {service.estimated_delivery_days} days
              </span>
            )}
            {service.requires_approval && (
              <span className="block mt-1 text-orange-600 dark:text-orange-400">
                This request requires approval
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {formFields.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium">Required Information</h3>
                {formFields.map((field: any, index: number) => (
                  <FormField
                    key={index}
                    control={form.control}
                    name={`form_data.${field.name}`}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel>
                          {field.label}
                          {field.required && <span className="text-red-500">*</span>}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={field.placeholder || ""}
                            {...formField}
                            required={field.required}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            )}

            <FormField
              control={form.control}
              name="additional_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional information or special requirements..."
                      rows={4}
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
                disabled={createRequest.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createRequest.isPending}>
                {createRequest.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Request
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
