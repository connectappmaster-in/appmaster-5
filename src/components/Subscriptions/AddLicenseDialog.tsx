import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useOrganisation } from "@/contexts/OrganisationContext";
import { useQuery } from "@tanstack/react-query";

const formSchema = z.object({
  tool_id: z.string().min(1, "Tool is required"),
  license_key: z.string().optional(),
  status: z.string().default("available"),
  assigned_to_user_id: z.string().optional(),
  assigned_to_device_id: z.string().optional(),
  assigned_date: z.string().optional(),
  expiry_date: z.string().optional(),
});

interface AddLicenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingLicense?: any;
}

export const AddLicenseDialog = ({ open, onOpenChange, onSuccess, editingLicense }: AddLicenseDialogProps) => {
  const { toast } = useToast();
  const { organisation } = useOrganisation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: tools } = useQuery({
    queryKey: ["subscriptions-tools", organisation?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions_tools")
        .select("id, tool_name")
        .eq("organisation_id", organisation?.id!)
        .eq("status", "active");

      if (error) throw error;
      return data;
    },
    enabled: !!organisation?.id,
  });

  const { data: users } = useQuery({
    queryKey: ["organisation-users", organisation?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email")
        .eq("organisation_id", organisation?.id!)
        .eq("status", "active");

      if (error) throw error;
      return data;
    },
    enabled: !!organisation?.id,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tool_id: "",
      license_key: "",
      status: "available",
      assigned_to_user_id: "",
      assigned_to_device_id: "",
      assigned_date: "",
      expiry_date: "",
    },
  });

  useEffect(() => {
    if (editingLicense) {
      form.reset({
        tool_id: editingLicense.tool_id || "",
        license_key: editingLicense.license_key || "",
        status: editingLicense.status || "available",
        assigned_to_user_id: editingLicense.assigned_to_user_id || "",
        assigned_to_device_id: editingLicense.assigned_to_device_id || "",
        assigned_date: editingLicense.assigned_date || "",
        expiry_date: editingLicense.expiry_date || "",
      });
    } else {
      form.reset({
        tool_id: "",
        license_key: "",
        status: "available",
        assigned_to_user_id: "",
        assigned_to_device_id: "",
        assigned_date: "",
        expiry_date: "",
      });
    }
  }, [editingLicense, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const licenseData = {
        organisation_id: organisation?.id!,
        tool_id: values.tool_id,
        license_key: values.license_key || null,
        status: values.status,
        assigned_to_user_id: values.assigned_to_user_id || null,
        assigned_to_device_id: values.assigned_to_device_id || null,
        assigned_date: values.assigned_date || null,
        expiry_date: values.expiry_date || null,
      };

      if (editingLicense) {
        const { error } = await supabase
          .from("subscriptions_licenses")
          .update(licenseData)
          .eq("id", editingLicense.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "License updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("subscriptions_licenses")
          .insert(licenseData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "License added successfully",
        });
      }

      form.reset();
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${editingLicense ? "update" : "add"} license`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingLicense ? "Edit License" : "Add New License"}</DialogTitle>
          <DialogDescription>
            {editingLicense ? "Update license information" : "Add a new software license to track"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tool_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tool *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a tool" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tools?.map((tool) => (
                        <SelectItem key={tool.id} value={tool.id}>
                          {tool.tool_name}
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
              name="license_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Key</FormLabel>
                  <FormControl>
                    <Input placeholder="XXXX-XXXX-XXXX-XXXX" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the license key if available
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="revoked">Revoked</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assigned_to_user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned To User</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users?.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name || user.email}
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
              name="assigned_to_device_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Device identifier" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter device ID if the license is tied to a specific device
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="assigned_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiry_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editingLicense ? "Update License" : "Add License"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
