import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

const assetSchema = z.object({
  name: z.string().min(1, "Name is required"),
  asset_type: z.string().optional(),
  purchase_date: z.string().min(1, "Purchase date is required"),
  purchase_price: z.string().min(1, "Purchase price is required"),
  current_value: z.string().optional(),
  salvage_value: z.string().optional(),
  useful_life_years: z.string().optional(),
  depreciation_method: z.string().optional(),
  status: z.string().optional(),
});

interface EditAssetDialogProps {
  asset: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditAssetDialog = ({ asset, open, onOpenChange }: EditAssetDialogProps) => {
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof assetSchema>>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: "",
      asset_type: "",
      purchase_date: "",
      purchase_price: "",
      current_value: "",
      salvage_value: "",
      useful_life_years: "",
      depreciation_method: "",
      status: "active",
    },
  });

  useEffect(() => {
    if (asset) {
      form.reset({
        name: asset.name || "",
        asset_type: asset.asset_type || "",
        purchase_date: asset.purchase_date || "",
        purchase_price: asset.purchase_price?.toString() || "",
        current_value: asset.current_value?.toString() || "",
        salvage_value: asset.salvage_value?.toString() || "",
        useful_life_years: asset.useful_life_years?.toString() || "",
        depreciation_method: asset.depreciation_method || "",
        status: asset.status || "active",
      });
    }
  }, [asset, form]);

  const updateAsset = useMutation({
    mutationFn: async (values: z.infer<typeof assetSchema>) => {
      const assetData = {
        name: values.name,
        asset_type: values.asset_type || null,
        purchase_date: values.purchase_date,
        purchase_price: parseFloat(values.purchase_price),
        current_value: values.current_value ? parseFloat(values.current_value) : null,
        salvage_value: values.salvage_value ? parseFloat(values.salvage_value) : null,
        useful_life_years: values.useful_life_years ? parseInt(values.useful_life_years) : null,
        depreciation_method: values.depreciation_method || null,
        status: values.status || "active",
      };

      const { data, error } = await supabase
        .from("assets")
        .update(assetData)
        .eq("id", asset.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Asset updated successfully");
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["itam-stats"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to update asset: " + error.message);
    },
  });

  const deleteAsset = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("assets").delete().eq("id", asset.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Asset deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["itam-stats"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to delete asset: " + error.message);
    },
  });

  const onSubmit = (values: z.infer<typeof assetSchema>) => {
    updateAsset.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Asset</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Dell Laptop" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="asset_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Laptop, Desktop, Server" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purchase_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purchase_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Price (₹) *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="current_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Value (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
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
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                        <SelectItem value="disposed">Disposed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="depreciation_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Depreciation Method</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="straight_line">Straight Line</SelectItem>
                        <SelectItem value="declining_balance">Declining Balance</SelectItem>
                        <SelectItem value="sum_of_years">Sum of Years</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="useful_life_years"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Useful Life (Years)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salvage_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salvage Value (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this asset?")) {
                    deleteAsset.mutate();
                  }
                }}
                disabled={updateAsset.isPending || deleteAsset.isPending}
              >
                {deleteAsset.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </Button>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={updateAsset.isPending || deleteAsset.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateAsset.isPending || deleteAsset.isPending}>
                  {updateAsset.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
