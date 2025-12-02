import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CategoryTagFormatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: any;
  existingFormat?: any;
}

export const CategoryTagFormatDialog = ({
  open,
  onOpenChange,
  category,
  existingFormat
}: CategoryTagFormatDialogProps) => {
  const queryClient = useQueryClient();
  const [prefix, setPrefix] = useState("");
  const [startNumber, setStartNumber] = useState("01");

  useEffect(() => {
    if (existingFormat) {
      setPrefix(existingFormat.prefix || "");
      setStartNumber(existingFormat.current_number?.toString().padStart(existingFormat.zero_padding || 2, '0') || "01");
    } else if (category) {
      // Auto-suggest prefix based on category name
      const categoryCode = category.name.substring(0, 3).toUpperCase();
      setPrefix(`RT-${categoryCode}-`);
      setStartNumber("01");
    }
  }, [category, existingFormat]);

  const paddingLength = startNumber.length || 2;

  const saveCategoryTagFormat = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: userData } = await supabase
        .from("users")
        .select("organisation_id")
        .eq("auth_user_id", user.id)
        .single();

      if (!userData?.organisation_id) throw new Error("Organization not found");

      // Get tenant_id from profiles
      const { data: profileData } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

      const formatData = {
        category_id: category.id,
        prefix: prefix,
        current_number: parseInt(startNumber) || 1,
        zero_padding: paddingLength,
        organisation_id: userData.organisation_id,
        tenant_id: profileData?.tenant_id || 1
      };

      if (existingFormat) {
        // Update existing
        const { error } = await supabase
          .from("category_tag_formats")
          .update(formatData)
          .eq("id", existingFormat.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from("category_tag_formats")
          .insert(formatData);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Category tag format saved successfully");
      queryClient.invalidateQueries({ queryKey: ["category-tag-formats"] });
      onOpenChange(false);
      // Reload the page to refresh the formats
      window.location.reload();
    },
    onError: (error: Error) => {
      toast.error("Failed to save tag format: " + error.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configure Tag Format - {category?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="prefix">Prefix</Label>
            <Input
              id="prefix"
              placeholder="e.g., RT-LTP-, RT-DSK-"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Unique identifier for this category (e.g., RT-LTP- for Laptops, RT-DSK- for Desktops)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="start-number">Starting Number</Label>
            <Input
              id="start-number"
              placeholder="e.g., 01, 001, 0001"
              value={startNumber}
              onChange={(e) => setStartNumber(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              First number in the sequence (padding will be calculated from length)
            </p>
          </div>

          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="text-sm font-medium">Preview:</div>
            <div className="text-2xl font-mono">{prefix}{startNumber}</div>
            <div className="text-xs text-muted-foreground">
              Padding: {paddingLength} digits | Next: {prefix}{(parseInt(startNumber) + 1).toString().padStart(paddingLength, '0')}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => saveCategoryTagFormat.mutate()}
              disabled={saveCategoryTagFormat.isPending || !prefix || !startNumber}
              className="flex-1"
            >
              {saveCategoryTagFormat.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Save Format
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
