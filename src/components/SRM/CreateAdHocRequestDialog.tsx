import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const requestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
});

type RequestFormData = z.infer<typeof requestSchema>;

interface CreateAdHocRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateAdHocRequestDialog = ({
  open,
  onOpenChange,
}: CreateAdHocRequestDialogProps) => {
  const queryClient = useQueryClient();

  const { data: userData } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: userRecord } = await supabase
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
        userId: userRecord?.id,
        organisationId: userRecord?.organisation_id,
        tenantId: profileData?.tenant_id || 1,
      };
    },
  });

  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
    },
  });

  const createRequest = useMutation({
    mutationFn: async (data: RequestFormData) => {
      if (!userData?.userId || !userData?.tenantId) {
        throw new Error("User data not available");
      }

      // Get or create default ad-hoc catalog item
      const { data: adHocItem, error: catalogError } = await supabase
        .from("srm_catalog")
        .select("id")
        .eq("name", "Ad-hoc Request")
        .eq("tenant_id", userData.tenantId)
        .maybeSingle();

      let catalogItemId = adHocItem?.id;

      if (!catalogItemId) {
        const { data: newItem } = await supabase
          .from("srm_catalog")
          .insert({
            name: "Ad-hoc Request",
            description: "General service request without specific catalog item",
            category: "general",
            tenant_id: userData.tenantId,
            organisation_id: userData.organisationId,
            is_active: true,
          })
          .select("id")
          .single();
        catalogItemId = newItem?.id;
      }

      if (!catalogItemId) throw new Error("Failed to create catalog item");

      const { data: requestNumber } = await supabase.rpc(
        "generate_srm_request_number",
        {
          p_tenant_id: userData.tenantId,
          p_org_id: userData.organisationId,
        }
      );

      const { error } = await supabase.from("srm_requests").insert({
        request_number: requestNumber,
        catalog_item_id: catalogItemId,
        requester_id: userData.userId,
        organisation_id: userData.organisationId,
        tenant_id: userData.tenantId,
        additional_notes: `${data.title}\n\n${data.description}`,
        priority: data.priority,
        status: "pending",
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Service request created successfully");
      queryClient.invalidateQueries({ queryKey: ["srm-requests"] });
      queryClient.invalidateQueries({ queryKey: ["srm-stats"] });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error("Failed to create request: " + error.message);
    },
  });

  const onSubmit = (data: RequestFormData) => {
    createRequest.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Service Request</DialogTitle>
          <DialogDescription>
            Submit a new service request. Your request will be reviewed and assigned to the appropriate team.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief description of your request" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide detailed information about your request"
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createRequest.isPending}>
                {createRequest.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit Request
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
