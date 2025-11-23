import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganisation } from "@/contexts/OrganisationContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddPaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddPaymentMethodDialog = ({
  open,
  onOpenChange,
}: AddPaymentMethodDialogProps) => {
  const { user } = useAuth();
  const { organisation } = useOrganisation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    cardNumber: "",
    cardBrand: "visa",
    expMonth: "",
    expYear: "",
    isDefault: true,
  });

  const addPaymentMethodMutation = useMutation({
    mutationFn: async () => {
      if (!organisation?.id || !user?.id) {
        throw new Error("Organization or user not found");
      }

      const last4 = formData.cardNumber.slice(-4);

      const { error } = await supabase.from("payment_methods").insert({
        organisation_id: organisation.id,
        user_id: user.id,
        card_last4: last4,
        card_brand: formData.cardBrand,
        card_exp_month: parseInt(formData.expMonth),
        card_exp_year: parseInt(formData.expYear),
        is_default: formData.isDefault,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
      toast({
        title: "Payment method added",
        description: "Your payment method has been added successfully.",
      });
      onOpenChange(false);
      setFormData({
        cardNumber: "",
        cardBrand: "visa",
        expMonth: "",
        expYear: "",
        isDefault: true,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add payment method",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.cardNumber.length < 13) {
      toast({
        title: "Invalid card number",
        description: "Please enter a valid card number",
        variant: "destructive",
      });
      return;
    }

    if (!formData.expMonth || !formData.expYear) {
      toast({
        title: "Invalid expiry date",
        description: "Please enter a valid expiry date",
        variant: "destructive",
      });
      return;
    }

    addPaymentMethodMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Payment Method</DialogTitle>
          <DialogDescription>
            Add a new payment method to your account
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={formData.cardNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setFormData({ ...formData, cardNumber: value });
                }}
                maxLength={16}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardBrand">Card Brand</Label>
              <Select
                value={formData.cardBrand}
                onValueChange={(value) =>
                  setFormData({ ...formData, cardBrand: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visa">Visa</SelectItem>
                  <SelectItem value="mastercard">Mastercard</SelectItem>
                  <SelectItem value="amex">American Express</SelectItem>
                  <SelectItem value="discover">Discover</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expMonth">Exp. Month</Label>
                <Input
                  id="expMonth"
                  placeholder="MM"
                  value={formData.expMonth}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (parseInt(value) <= 12) {
                      setFormData({ ...formData, expMonth: value });
                    }
                  }}
                  maxLength={2}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expYear">Exp. Year</Label>
                <Input
                  id="expYear"
                  placeholder="YYYY"
                  value={formData.expYear}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, expYear: value });
                  }}
                  maxLength={4}
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={addPaymentMethodMutation.isPending}>
              {addPaymentMethodMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Payment Method
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
