import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useOrganisation } from "@/contexts/OrganisationContext";
import { useQuery } from "@tanstack/react-query";
import { AddCurrencyDialog } from "./AddCurrencyDialog";
import { Plus } from "lucide-react";

const formSchema = z.object({
  tool_name: z.string().min(1, "Tool name is required"),
  category: z.string().min(1, "Category is required"),
  vendor_id: z.string().optional(),
  subscription_type: z.string().min(1, "Subscription type is required"),
  cost: z.string().min(1, "Cost is required"),
  currency: z.string().default("INR"),
  renewal_date: z.string().optional(),
  billing_cycle_months: z.string().default("1"),
  auto_renew: z.boolean().default(false),
  license_count: z.string().default("1"),
  status: z.string().default("active"),
  notes: z.string().optional(),
});

interface AddToolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingTool?: any | null;
}

export const AddToolDialog = ({ open, onOpenChange, onSuccess, editingTool }: AddToolDialogProps) => {
  const { toast } = useToast();
  const { organisation } = useOrganisation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addCurrencyOpen, setAddCurrencyOpen] = useState(false);

  const { data: vendors } = useQuery({
    queryKey: ["subscriptions-vendors", organisation?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions_vendors")
        .select("*")
        .eq("organisation_id", organisation?.id!);

      if (error) throw error;
      return data;
    },
    enabled: !!organisation?.id,
  });

  const { data: currencies, refetch: refetchCurrencies } = useQuery({
    queryKey: ["currencies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("currencies")
        .select("*")
        .eq("is_active", true)
        .order("code");

      if (error) throw error;
      return data;
    },
  });

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    tool_name: "",
    category: "",
    vendor_id: "",
    subscription_type: "",
    cost: "",
    currency: "INR",
    renewal_date: "",
    billing_cycle_months: "1",
    auto_renew: false,
    license_count: "1",
    status: "active",
    notes: "",
  },
});

useEffect(() => {
  if (!open) return;

  if (editingTool) {
    form.reset({
      tool_name: editingTool.tool_name || "",
      category: editingTool.category || "",
      vendor_id: editingTool.vendor_id || "",
      subscription_type: editingTool.subscription_type || "",
      cost: editingTool.cost?.toString() || "",
      currency: editingTool.currency || "INR",
      renewal_date: editingTool.renewal_date || "",
      billing_cycle_months: editingTool.billing_cycle_months?.toString() || "1",
      auto_renew: !!editingTool.auto_renew,
      license_count: editingTool.license_count?.toString() || "1",
      status: editingTool.status || "active",
      notes: editingTool.notes || "",
    });
  } else {
    form.reset({
      tool_name: "",
      category: "",
      vendor_id: "",
      subscription_type: "",
      cost: "",
      currency: "INR",
      renewal_date: "",
      billing_cycle_months: "1",
      auto_renew: false,
      license_count: "1",
      status: "active",
      notes: "",
    });
  }
}, [editingTool, open, form]);

const onSubmit = async (values: z.infer<typeof formSchema>) => {
  setIsSubmitting(true);
  try {
    let error;

    const payload = {
      organisation_id: organisation?.id!,
      tool_name: values.tool_name,
      category: values.category,
      vendor_id: values.vendor_id || null,
      subscription_type: values.subscription_type,
      cost: parseFloat(values.cost),
      currency: values.currency,
      renewal_date: values.renewal_date || null,
      next_billing_date: values.renewal_date || null,
      billing_cycle_months: parseInt(values.billing_cycle_months),
      auto_renew: values.auto_renew,
      license_count: parseInt(values.license_count),
      status: values.status,
      notes: values.notes || null,
    };

    if (editingTool) {
      const { error: updateError } = await supabase
        .from("subscriptions_tools")
        .update(payload)
        .eq("id", editingTool.id)
        .eq("organisation_id", organisation?.id!);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("subscriptions_tools")
        .insert(payload);
      error = insertError;
    }

    if (error) throw error;

    toast({
      title: "Success",
      description: editingTool ? "Tool updated successfully" : "Tool added successfully",
    });

    form.reset();
    onOpenChange(false);
    onSuccess();
  } catch (error: any) {
    toast({
      title: "Error",
      description: error.message || (editingTool ? "Failed to update tool" : "Failed to add tool"),
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
          <DialogTitle>{editingTool ? "Edit Tool" : "Add New Tool"}</DialogTitle>
          <DialogDescription>
            {editingTool
              ? "Update this software tool's subscription details"
              : "Add a new software tool or SaaS subscription to track"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tool_name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Tool Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Slack, Zoom, GitHub" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SaaS">SaaS</SelectItem>
                        <SelectItem value="Desktop Software">Desktop Software</SelectItem>
                        <SelectItem value="Cloud Service">Cloud Service</SelectItem>
                        <SelectItem value="Security Tool">Security Tool</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vendor_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vendor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vendors?.map((vendor) => (
                          <SelectItem key={vendor.id} value={vendor.id}>
                            {vendor.vendor_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Optional - add vendors in Vendors tab</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subscription_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subscription Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="per_user">Per User</SelectItem>
                        <SelectItem value="per_device">Per Device</SelectItem>
                        <SelectItem value="one_time">One Time</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencies?.map((currency) => (
                          <SelectItem key={currency.id} value={currency.code}>
                            {currency.code} ({currency.symbol})
                          </SelectItem>
                        ))}
                        <div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground border-t mt-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start h-auto p-1 font-normal"
                            onClick={(e) => {
                              e.preventDefault();
                              setAddCurrencyOpen(true);
                            }}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Currency
                          </Button>
                        </div>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="license_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Count</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="renewal_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Renewal Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="auto_renew"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 col-span-2">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Auto-renew</FormLabel>
                      <FormDescription>
                        Automatically renew this subscription
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional notes..." {...field} />
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
                {isSubmitting
                  ? editingTool
                    ? "Saving..."
                    : "Adding..."
                  : editingTool
                  ? "Save Changes"
                  : "Add Tool"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      <AddCurrencyDialog
        open={addCurrencyOpen}
        onOpenChange={setAddCurrencyOpen}
        onSuccess={refetchCurrencies}
      />
    </Dialog>
  );
};
