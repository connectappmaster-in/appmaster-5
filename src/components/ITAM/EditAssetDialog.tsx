import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Image as ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { ImagePickerDialog } from "./ImagePickerDialog";
import { useAssetSetupConfig } from "@/hooks/useAssetSetupConfig";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const assetSchema = z.object({
  asset_id: z.string().min(1, "Asset ID is required"),
  brand: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  description: z.string().optional(),
  asset_configuration: z.string().optional(),
  purchase_date: z.string().min(1, "Purchase date is required"),
  cost: z.string().min(1, "Cost is required"),
  serial_number: z.string().optional(),
  purchased_from: z.string().optional(),
  classification: z.string().optional(),
  site: z.string().optional(),
  location: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  department: z.string().optional(),
  photo_url: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  assigned_to: z.string().optional()
});
interface EditAssetDialogProps {
  asset: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export const EditAssetDialog = ({
  asset,
  open,
  onOpenChange
}: EditAssetDialogProps) => {
  const queryClient = useQueryClient();
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const { sites, locations, categories, departments, makes } = useAssetSetupConfig();
   
  const form = useForm<z.infer<typeof assetSchema>>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      asset_id: "",
      brand: "",
      model: "",
      description: "",
      asset_configuration: "",
      purchase_date: "",
      cost: "",
      serial_number: "",
      purchased_from: "",
      classification: "Internal",
      site: "",
      location: "",
      category: "",
      department: "",
      photo_url: "",
      status: "available",
      assigned_to: ""
    }
  });
  useEffect(() => {
    if (asset) {
      form.reset({
        asset_id: asset.asset_id || "",
        brand: asset.brand || "",
        model: asset.model || "",
        description: asset.description || "",
        asset_configuration: asset.asset_configuration || "",
        purchase_date: asset.purchase_date || "",
        cost: asset.cost?.toString() || "",
        serial_number: asset.serial_number || "",
        purchased_from: asset.purchased_from || "",
        classification: asset.classification || "Internal",
        site: asset.site || "",
        location: asset.location || "",
        category: asset.category || "",
        department: asset.department || "",
        photo_url: asset.photo_url || "",
        status: asset.status || "available",
        assigned_to: asset.assigned_to || ""
      });
    }
  }, [asset, form]);
  const updateAsset = useMutation({
    mutationFn: async (values: z.infer<typeof assetSchema>) => {
      const updateData = {
        asset_id: values.asset_id,
        brand: values.brand,
        model: values.model,
        name: `${values.brand} ${values.model}`,
        description: values.description || null,
        asset_configuration: values.asset_configuration || null,
        purchase_date: values.purchase_date,
        cost: parseFloat(values.cost),
        serial_number: values.serial_number || null,
        purchased_from: values.purchased_from || null,
        classification: values.classification || "Internal",
        site: values.site || null,
        location: values.location || null,
        category: values.category,
        department: values.department || null,
        photo_url: values.photo_url || null,
        status: values.status,
        assigned_to: values.assigned_to || null,
        updated_at: new Date().toISOString()
      };
      const {
        data,
        error
      } = await supabase.from("itam_assets").update(updateData).eq("id", asset.id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Asset updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["itam-assets-list"]
      });
      queryClient.invalidateQueries({
        queryKey: ["assets-count"]
      });
      queryClient.invalidateQueries({
        queryKey: ["assets"]
      });
      queryClient.invalidateQueries({
        queryKey: ["itam-stats"]
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to update asset: " + error.message);
    }
  });
  const deleteAsset = useMutation({
    mutationFn: async () => {
      const {
        error
      } = await supabase.from("itam_assets").update({
        is_deleted: true
      }).eq("id", asset.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Asset deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["itam-assets-list"]
      });
      queryClient.invalidateQueries({
        queryKey: ["assets-count"]
      });
      queryClient.invalidateQueries({
        queryKey: ["assets"]
      });
      queryClient.invalidateQueries({
        queryKey: ["itam-stats"]
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to delete asset: " + error.message);
    }
  });
  const onSubmit = (values: z.infer<typeof assetSchema>) => {
    updateAsset.mutate(values);
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Asset</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic Info Section */}
            <div>
              <h3 className="text-xs font-semibold mb-2 text-muted-foreground uppercase">Basic Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField control={form.control} name="asset_id" render={({
                field
              }) => <FormItem>
                      <FormLabel>Asset ID *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., ASSET-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="brand" render={({
                field
              }) => <FormItem>
                      <FormLabel>Make *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select make" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {makes.map((make) => (
                            <SelectItem key={make.id} value={make.name}>
                              {make.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="model" render={({
                field
              }) => <FormItem>
                      <FormLabel>Model *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Latitude 5420" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="description" render={({
                field
              }) => <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="asset_configuration" render={({
                field
              }) => <FormItem className="md:col-span-2">
                      <FormLabel>Asset Configuration</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., i7, 16GB RAM, 512GB SSD" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
              </div>
            </div>

            {/* Purchase Section */}
            <div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField control={form.control} name="purchase_date" render={({
                field
              }) => <FormItem>
                      <FormLabel>Purchase Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="cost" render={({
                field
              }) => <FormItem>
                      <FormLabel>Cost (₹) *</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="serial_number" render={({
                field
              }) => <FormItem>
                      <FormLabel>Serial No</FormLabel>
                      <FormControl>
                        <Input placeholder="Serial number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="purchased_from" render={({
                field
              }) => <FormItem>
                      <FormLabel>Purchased From</FormLabel>
                      <FormControl>
                        <Input placeholder="Vendor name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
              </div>
            </div>

            {/* Classification Section */}
            <div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField control={form.control} name="classification" render={({
                field
              }) => <FormItem>
                      <FormLabel>Asset Classification</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select classification" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Confidential">Confidential</SelectItem>
                          <SelectItem value="Internal">Internal</SelectItem>
                          <SelectItem value="Public">Public</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>} />
              </div>
            </div>

            {/* Organization Section */}
            <div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField control={form.control} name="site" render={({
                field
              }) => <FormItem>
                      <FormLabel>Site</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select site" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sites.map((site) => (
                            <SelectItem key={site.id} value={site.name}>
                              {site.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="location" render={({
                field
              }) => <FormItem>
                      <FormLabel>Location</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location.id} value={location.name}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="category" render={({
                field
              }) => <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="department" render={({
                field
              }) => <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.name}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                       <FormMessage />
                    </FormItem>} />
              </div>
            </div>

            {/* Status Section */}
            <div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField control={form.control} name="status" render={({
                field
              }) => <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="assigned">Assigned</SelectItem>
                          <SelectItem value="in_repair">In Repair</SelectItem>
                          <SelectItem value="retired">Retired</SelectItem>
                          <SelectItem value="lost">Lost</SelectItem>
                          <SelectItem value="disposed">Disposed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="assigned_to" render={({
                field
              }) => <FormItem>
                      <FormLabel>Assigned To</FormLabel>
                      <FormControl>
                        <Input placeholder="User or department" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
              </div>
            </div>

            {/* Photo Section */}
            <div>
              <FormField control={form.control} name="photo_url" render={({
              field
            }) => <FormItem>
                    <FormLabel>Add Image</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setImagePickerOpen(true)}
                          className="w-full"
                        >
                          <ImageIcon className="mr-2 h-4 w-4" />
                          Browse Images
                        </Button>
                        {field.value && (
                          <div className="relative w-full h-32 border rounded-lg overflow-hidden">
                            <img
                              src={field.value}
                              alt="Asset preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
            </div>

            <ImagePickerDialog
              open={imagePickerOpen}
              onOpenChange={setImagePickerOpen}
              onImageSelect={(url) => {
                form.setValue("photo_url", url);
                setImagePickerOpen(false);
              }}
              currentImage={form.watch("photo_url")}
            />

            <div className="flex justify-between pt-3 border-t">
              <Button type="button" variant="destructive" onClick={() => setDeleteConfirmOpen(true)} disabled={updateAsset.isPending || deleteAsset.isPending}>
                {deleteAsset.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={updateAsset.isPending || deleteAsset.isPending}>
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

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={() => {
          deleteAsset.mutate();
          setDeleteConfirmOpen(false);
        }}
        title="Delete Asset"
        description="Are you sure you want to delete this asset? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />
    </Dialog>;
};