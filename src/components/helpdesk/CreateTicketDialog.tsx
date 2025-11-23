import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { CreateCategoryDialog } from "./CreateCategoryDialog";

const ticketSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  category_id: z.string().optional(),
});

interface CreateTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateTicketDialog = ({ open, onOpenChange }: CreateTicketDialogProps) => {
  const queryClient = useQueryClient();
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["helpdesk-categories"],
    queryFn: async () => {
      const { data } = await supabase
        .from("helpdesk_categories")
        .select("*")
        .eq("is_active", true)
        .order("name");
      return data || [];
    },
  });

  // Get current user info
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

  const form = useForm<z.infer<typeof ticketSchema>>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      category_id: "",
    },
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const createTicket = useMutation({
    mutationFn: async (values: z.infer<typeof ticketSchema>) => {
      if (!currentUser) throw new Error("User not found");

      // Generate ticket number
      const { data: ticketNumber } = await supabase.rpc(
        "generate_helpdesk_ticket_number",
        {
          p_tenant_id: currentUser.tenantId,
          p_org_id: currentUser.orgId,
        }
      );

      const ticketData = {
        title: values.title,
        description: values.description,
        priority: values.priority,
        category_id: values.category_id ? parseInt(values.category_id) : null,
        ticket_number: ticketNumber,
        requester_id: currentUser.userId,
        created_by: currentUser.userId,
        organisation_id: currentUser.orgId,
        tenant_id: currentUser.tenantId,
        status: "open",
      };

      const { data, error } = await supabase
        .from("helpdesk_tickets")
        .insert(ticketData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Ticket created successfully");
      queryClient.invalidateQueries({ queryKey: ["helpdesk-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["helpdesk-dashboard-stats"] });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to create ticket: " + error.message);
    },
  });

  const onSubmit = (values: z.infer<typeof ticketSchema>) => {
    createTicket.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Ticket</DialogTitle>
          <DialogDescription>
            Submit a support request or report an issue. We'll get back to you as soon as possible.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief description of the issue" {...field} />
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
                      placeholder="Provide detailed information about your request..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
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

              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-[100]">
                        {categories && categories.length > 0 && (
                          categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full justify-start px-2 py-1.5 h-auto font-normal"
                          onClick={(e) => {
                            e.preventDefault();
                            setCategoryDialogOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Category
                        </Button>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createTicket.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createTicket.isPending}>
                {createTicket.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Ticket
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>

      <CreateCategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
      />
    </Dialog>
  );
};
