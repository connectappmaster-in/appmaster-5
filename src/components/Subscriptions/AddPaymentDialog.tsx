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
  amount: z.string().min(1, "Amount is required"),
  currency: z.string().default("INR"),
  payment_date: z.string().min(1, "Payment date is required"),
  billing_period_start: z.string().min(1, "Billing period start is required"),
  billing_period_end: z.string().min(1, "Billing period end is required"),
  status: z.string().default("paid"),
  payment_method: z.string().optional(),
  invoice_url: z.string().optional(),
});

interface AddPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingPayment?: any;
}

export const AddPaymentDialog = ({ open, onOpenChange, onSuccess, editingPayment }: AddPaymentDialogProps) => {
  const { toast } = useToast();
  const { organisation } = useOrganisation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: tools } = useQuery({
    queryKey: ["subscriptions-tools", organisation?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions_tools")
        .select("id, tool_name, currency")
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
      amount: "",
      currency: "INR",
      payment_date: "",
      billing_period_start: "",
      billing_period_end: "",
      status: "paid",
      payment_method: "",
      invoice_url: "",
    },
  });

  useEffect(() => {
    if (editingPayment) {
      form.reset({
        tool_id: editingPayment.tool_id || "",
        amount: editingPayment.amount?.toString() || "",
        currency: editingPayment.currency || "INR",
        payment_date: editingPayment.payment_date || "",
        billing_period_start: editingPayment.billing_period_start || "",
        billing_period_end: editingPayment.billing_period_end || "",
        status: editingPayment.status || "paid",
        payment_method: editingPayment.payment_method || "",
        invoice_url: editingPayment.invoice_url || "",
      });
    } else {
      form.reset({
        tool_id: "",
        amount: "",
        currency: "INR",
        payment_date: "",
        billing_period_start: "",
        billing_period_end: "",
        status: "paid",
        payment_method: "",
        invoice_url: "",
      });
    }
  }, [editingPayment, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const paymentData = {
        organisation_id: organisation?.id!,
        tool_id: values.tool_id,
        amount: parseFloat(values.amount),
        currency: values.currency,
        payment_date: values.payment_date,
        billing_period_start: values.billing_period_start,
        billing_period_end: values.billing_period_end,
        status: values.status,
        payment_method: values.payment_method || null,
        invoice_url: values.invoice_url || null,
      };

      if (editingPayment) {
        const { error } = await supabase
          .from("subscriptions_payments")
          .update(paymentData)
          .eq("id", editingPayment.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Payment updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("subscriptions_payments")
          .insert(paymentData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Payment added successfully",
        });
      }

      form.reset();
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${editingPayment ? "update" : "add"} payment`,
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
          <DialogTitle>{editingPayment ? "Edit Payment" : "Add New Payment"}</DialogTitle>
          <DialogDescription>
            {editingPayment ? "Update payment information" : "Record a new subscription payment"}
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount *</FormLabel>
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
                    <FormLabel>Currency *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="payment_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Date *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="billing_period_start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Period Start *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billing_period_end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Period End *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="debit_card">Debit Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="netbanking">Net Banking</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="invoice_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Link to the invoice document
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editingPayment ? "Update Payment" : "Add Payment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
