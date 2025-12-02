import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface EditCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: { id: number; name: string } | null;
}

export function EditCategoryDialog({ open, onOpenChange, category }: EditCategoryDialogProps) {
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open && category) {
      setName(category.name || "");
    }
  }, [open, category]);

  const updateCategory = useMutation({
    mutationFn: async () => {
      if (!category) throw new Error("No category selected");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: userData } = await supabase
        .from("users")
        .select("organisation_id")
        .eq("auth_user_id", user.id)
        .single();

      if (!userData?.organisation_id) throw new Error("Organization not found");

      const { error } = await supabase
        .from("itam_categories")
        .update({
          name: name.trim(),
          code: name.trim().substring(0, 10).toUpperCase(),
        })
        .eq("id", category.id)
        .eq("organisation_id", userData.organisation_id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Category updated successfully");
      queryClient.invalidateQueries({ queryKey: ["itam-categories"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to update category: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a category name");
      return;
    }
    updateCategory.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category-name">Category Name</Label>
              <Input
                id="edit-category-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter category name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateCategory.isPending}>
              {updateCategory.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
