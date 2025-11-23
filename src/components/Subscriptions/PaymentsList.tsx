import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganisation } from "@/contexts/OrganisationContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, MoreVertical, Edit, Trash2, Receipt, ExternalLink } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { AddPaymentDialog } from "./AddPaymentDialog";
import { useToast } from "@/hooks/use-toast";
import { convertToINR, formatINR } from "@/lib/currencyConversion";

export const PaymentsList = () => {
  const { organisation } = useOrganisation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);

  const { data: payments, isLoading, refetch } = useQuery({
    queryKey: ["subscriptions-payments", organisation?.id, searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("subscriptions_payments")
        .select(`
          *,
          subscriptions_tools(tool_name, currency)
        `)
        .eq("organisation_id", organisation?.id!);

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query.order("payment_date", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!organisation?.id,
  });

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("subscriptions_payments")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete payment",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Payment deleted successfully",
      });
      refetch();
    }
  };

  const handleEdit = (payment: any) => {
    setEditingPayment(payment);
    setIsAddDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setEditingPayment(null);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      paid: "default",
      pending: "secondary",
      failed: "destructive",
      refunded: "outline",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  // Calculate total in INR
  const totalInINR = payments?.reduce((sum, payment) => {
    const amountInINR = convertToINR(payment.amount, payment.currency || "INR");
    return sum + amountInINR;
  }, 0) || 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <p className="text-center text-muted-foreground">Loading payments...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Payment
        </Button>
      </div>

      {/* Summary Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Payments</p>
              <p className="text-2xl font-bold">{formatINR(totalInINR)}</p>
            </div>
            <Receipt className="w-8 h-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            Track subscription payments and invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!payments || payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No payments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tool</TableHead>
                    <TableHead>Amount (INR)</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Billing Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => {
                    const amountInINR = convertToINR(payment.amount, payment.currency || "INR");
                    return (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {payment.subscriptions_tools?.tool_name || "N/A"}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatINR(amountInINR)}
                          {payment.currency !== "INR" && (
                            <span className="text-xs text-muted-foreground block">
                              ({payment.amount} {payment.currency})
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {payment.payment_date
                            ? format(new Date(payment.payment_date), "MMM dd, yyyy")
                            : "-"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {payment.billing_period_start && payment.billing_period_end ? (
                            <>
                              {format(new Date(payment.billing_period_start), "MMM dd")} -{" "}
                              {format(new Date(payment.billing_period_end), "MMM dd, yyyy")}
                            </>
                          ) : "-"}
                        </TableCell>
                        <TableCell>{getStatusBadge(payment.status || "pending")}</TableCell>
                        <TableCell className="capitalize">
                          {payment.payment_method || "-"}
                        </TableCell>
                        <TableCell>
                          {payment.invoice_url ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(payment.invoice_url, "_blank")}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(payment)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(payment.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddPaymentDialog
        open={isAddDialogOpen}
        onOpenChange={handleDialogClose}
        onSuccess={() => {
          refetch();
          handleDialogClose();
        }}
        editingPayment={editingPayment}
      />
    </div>
  );
};
