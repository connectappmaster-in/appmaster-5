import { useState, useEffect } from "react";
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
import { Loader2, ImagePlus, RefreshCw } from "lucide-react";
import { ImagePickerDialog } from "./ImagePickerDialog";
import { useAssetSetupConfig } from "@/hooks/useAssetSetupConfig";
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
  photo_url: z.string().optional()
});
interface CreateAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export const CreateAssetDialog = ({
  open,
  onOpenChange
}: CreateAssetDialogProps) => {
  const queryClient = useQueryClient();
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [isGeneratingId, setIsGeneratingId] = useState(false);
  const {
    sites,
    locations,
    categories,
    departments,
    makes
  } = useAssetSetupConfig();
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
      photo_url: ""
    }
  });

  // Clear form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open, form]);
  const generateFallbackAssetId = async (): Promise<string> => {
    // Fallback: Get the last asset ID from the database and increment
    const {
      data: userData
    } = await supabase.from('users').select('organisation_id').eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id).single();
    if (!userData?.organisation_id) {
      return `AS-${Date.now().toString().slice(-6)}`;
    }

    // Get tag format
    const {
      data: tagFormat
    } = await supabase.from('itam_tag_format').select('prefix, padding_length, start_number').eq('organisation_id', userData.organisation_id).maybeSingle();
    const prefix = tagFormat?.prefix || 'AS-';
    // Prefer start_number length, then padding_length, then default
    const paddingLength = (tagFormat?.start_number?.length ?? 0) || tagFormat?.padding_length || 4;
    const startNumberRaw = tagFormat?.start_number || '1';
    const parsedStart = parseInt(startNumberRaw, 10);
    const effectiveStart = Number.isNaN(parsedStart) ? 1 : parsedStart;

    // Get the highest existing asset ID
    const {
      data: assets
    } = await supabase.from('itam_assets').select('asset_id').eq('organisation_id', userData.organisation_id).order('created_at', {
      ascending: false
    }).limit(50);
    let maxNumber = 0;
    if (assets && assets.length > 0) {
      assets.forEach(asset => {
        if (asset.asset_id?.startsWith(prefix)) {
          const numPart = asset.asset_id.substring(prefix.length).replace(/\D/g, '');
          const num = parseInt(numPart, 10);
          if (!isNaN(num) && num > maxNumber) {
            maxNumber = num;
          }
        }
      });
    }
    const candidateNext = maxNumber > 0 ? maxNumber + 1 : effectiveStart;
    const nextNumber = Math.max(candidateNext, effectiveStart);
    const paddedNumber = nextNumber.toString().padStart(paddingLength, '0');
    return `${prefix}${paddedNumber}`;
  };
  const generateAssetIdByCategory = async (categoryName: string) => {
    // Find category ID from name
    const selectedCategory = categories.find(cat => cat.name === categoryName);
    if (!selectedCategory) {
      toast.error("Please select a valid category");
      return '';
    }

    setIsGeneratingId(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-next-asset-id-by-category', {
        body: { category_id: selectedCategory.id }
      });

      if (error) {
        console.error('Error calling edge function:', error);
        if (data?.needsConfiguration) {
          toast.error(data.error);
          return '';
        }
        toast.error("Failed to generate asset ID. Please configure tag format for this category.");
        return '';
      }

      if (data?.warning) {
        toast.warning(data.warning);
      }

      return data?.assetId || '';
    } catch (err) {
      console.error('Exception calling edge function:', err);
      toast.error("Error generating asset ID");
      return '';
    } finally {
      setIsGeneratingId(false);
    }
  };

  // Watch for category changes and auto-generate asset ID
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'category' && value.category) {
        generateAssetIdByCategory(value.category).then(assetId => {
          if (assetId) {
            form.setValue('asset_id', assetId);
          }
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [form, categories]);
  const validateAssetIdUniqueness = async (assetId: string): Promise<boolean> => {
    try {
      const {
        data,
        error
      } = await supabase.from('itam_assets').select('asset_id').eq('asset_id', assetId).maybeSingle();
      if (error) {
        console.error('Error validating asset ID:', error);
        return true; // Allow submission if validation fails
      }
      return !data; // Return true if asset_id doesn't exist (unique)
    } catch (error) {
      console.error('Error:', error);
      return true;
    }
  };
  const createAsset = useMutation({
    mutationFn: async (values: z.infer<typeof assetSchema>) => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const {
        data: userData
      } = await supabase.from("users").select("id, organisation_id").eq("auth_user_id", user.id).single();
      const {
        data: profileData
      } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).maybeSingle();

      // Validate both asset_id and asset_tag uniqueness
      const { data: existingAssetById } = await supabase
        .from("itam_assets")
        .select("id")
        .eq("asset_id", values.asset_id)
        .maybeSingle();

      const { data: existingAssetByTag } = await supabase
        .from("itam_assets")
        .select("id")
        .eq("asset_tag", values.asset_id)
        .maybeSingle();

      if (existingAssetById || existingAssetByTag) {
        throw new Error("Asset ID already exists. Please use a different ID.");
      }

      // Generate asset tag from asset_id or auto-generate
      const assetTag = values.asset_id || `AST-${Date.now().toString().slice(-6)}`;
      const assetData = {
        asset_id: values.asset_id,
        asset_tag: assetTag,
        brand: values.brand,
        model: values.model,
        type: values.category,
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
        status: "available",
        created_by: userData?.id,
        organisation_id: userData?.organisation_id,
        tenant_id: profileData?.tenant_id || 1
      };
      const {
        data,
        error
      } = await supabase.from("itam_assets").insert([assetData]).select().single();
      if (error) throw error;

      // Reserve the next asset ID for this category
      const selectedCategory = categories.find(cat => cat.name === values.category);
      if (selectedCategory) {
        try {
          await supabase.functions.invoke('reserve-next-asset-id', {
            body: { category_id: selectedCategory.id }
          });
        } catch (err) {
          console.error('Error reserving next ID:', err);
          // Don't fail the asset creation if reservation fails
        }
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Asset created successfully");
      // Invalidate all asset-related queries
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
      queryClient.invalidateQueries({
        queryKey: ["itam-assets"]
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to create asset: " + error.message);
    }
  });
  const onSubmit = async (values: z.infer<typeof assetSchema>) => {
    // Validate asset ID uniqueness before submitting
    const isUnique = await validateAssetIdUniqueness(values.asset_id);
    if (!isUnique) {
      form.setError('asset_id', {
        type: 'manual',
        message: 'Asset ID already exists. Please use a unique ID.'
      });
      toast.error('Asset ID already exists. Please use a unique ID.');
      return;
    }
    createAsset.mutate(values);
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Asset</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            {/* Basic Info Section */}
            <div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <FormField control={form.control} name="category" render={({
                field
              }) => <FormItem>
                      <FormLabel className="text-xs">Category *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(category => <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="asset_id" render={({
                field
              }) => <FormItem>
                      <FormLabel className="text-xs">Asset ID *</FormLabel>
                      <FormControl>
                        <Input className="h-8" {...field} placeholder="Select category first" disabled={isGeneratingId} />
                      </FormControl>
                      <FormMessage />
                      {isGeneratingId && <p className="text-xs text-muted-foreground">Generating ID...</p>}
                    </FormItem>} />

                <FormField control={form.control} name="brand" render={({
                field
              }) => <FormItem>
                      <FormLabel className="text-xs">Make *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Select make" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {makes.map(make => <SelectItem key={make.id} value={make.name}>
                              {make.name}
                            </SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="model" render={({
                field
              }) => <FormItem>
                      <FormLabel className="text-xs">Model *</FormLabel>
                      <FormControl>
                        <Input className="h-8" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="description" render={({
                field
              }) => <FormItem>
                      <FormLabel className="text-xs">Description</FormLabel>
                      <FormControl>
                        <Input className="h-8" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="asset_configuration" render={({
                field
              }) => <FormItem className="md:col-span-2">
                      <FormLabel className="text-xs">Asset Configuration</FormLabel>
                      <FormControl>
                        <Input className="h-8" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
              </div>
            </div>

            {/* Purchase Section */}
            <div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <FormField control={form.control} name="purchase_date" render={({
                field
              }) => <FormItem>
                      <FormLabel className="text-xs">Purchase Date *</FormLabel>
                      <FormControl>
                        <Input type="date" className="h-8" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="cost" render={({
                field
              }) => <FormItem>
                      <FormLabel className="text-xs">Cost (₹) *</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" className="h-8" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="serial_number" render={({
                field
              }) => <FormItem>
                      <FormLabel className="text-xs">Serial No</FormLabel>
                      <FormControl>
                        <Input className="h-8" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="purchased_from" render={({
                field
              }) => <FormItem>
                      <FormLabel className="text-xs">Purchased From</FormLabel>
                      <FormControl>
                        <Input className="h-8" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
              </div>
            </div>

            {/* Organization Section */}
            <div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <FormField control={form.control} name="site" render={({
                field
              }) => <FormItem>
                      <FormLabel className="text-xs">Site</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Select site" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sites.map(site => <SelectItem key={site.id} value={site.name}>
                              {site.name}
                            </SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="location" render={({
                field
              }) => <FormItem>
                      <FormLabel className="text-xs">Location</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations.map(location => <SelectItem key={location.id} value={location.name}>
                              {location.name}
                            </SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="department" render={({
                field
              }) => <FormItem>
                      <FormLabel className="text-xs">Department</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map(dept => <SelectItem key={dept.id} value={dept.name}>
                              {dept.name}
                            </SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>} />
              </div>
            </div>

            {/* Classification & Image Section - Bottom Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Classification Section - Bottom Left */}
              <div>
                <h3 className="text-xs font-semibold mb-1.5 text-muted-foreground uppercase">Classification</h3>
                <FormField control={form.control} name="classification" render={({
                field
              }) => <FormItem>
                      <FormLabel className="text-xs">Asset Classification</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="h-8">
                            <SelectValue />
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

              {/* Photo Section - Bottom Right */}
              <div>
                <h3 className="text-xs font-semibold mb-1.5 text-muted-foreground uppercase">Asset Image</h3>
                <FormField control={form.control} name="photo_url" render={({
                field
              }) => <FormItem>
                      <FormLabel className="text-xs">Image</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          
                        </FormControl>
                        <Button type="button" variant="outline" size="sm" onClick={() => setImagePickerOpen(true)}>
                          <ImagePlus className="h-4 w-4 mr-1" />
                          Browse
                        </Button>
                      </div>
                      {field.value && <div className="mt-2 relative w-32 h-32 rounded-md border overflow-hidden">
                          <img src={field.value} alt="Preview" className="w-full h-full object-cover" />
                        </div>}
                      <FormMessage />
                    </FormItem>} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={createAsset.isPending}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={createAsset.isPending}>
                {createAsset.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Asset
              </Button>
            </div>
          </form>
        </Form>

        <ImagePickerDialog open={imagePickerOpen} onOpenChange={setImagePickerOpen} onImageSelect={url => form.setValue("photo_url", url)} currentImage={form.watch("photo_url")} />
      </DialogContent>
    </Dialog>;
};