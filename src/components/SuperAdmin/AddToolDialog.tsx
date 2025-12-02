import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddToolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AddToolDialog = ({ open, onOpenChange, onSuccess }: AddToolDialogProps) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    key: "",
    description: "",
    active: true,
    monthly_price: 0,
    yearly_price: 0
  });

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.key.trim()) {
      toast.error("Tool name and key are required");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("tools").insert([
        {
          name: formData.name.trim(),
          key: formData.key.trim(),
          description: formData.description.trim() || null,
          active: formData.active,
          monthly_price: formData.monthly_price,
          yearly_price: formData.yearly_price
        }
      ]);

      if (error) throw error;

      toast.success("Tool added successfully");
      onSuccess();
      onOpenChange(false);
      // Reset form
      setFormData({
        name: "",
        key: "",
        description: "",
        active: true,
        monthly_price: 0,
        yearly_price: 0
      });
    } catch (error: any) {
      console.error("Error adding tool:", error);
      toast.error(error.message || "Failed to add tool");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Tool</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tool Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., IT Helpdesk"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="key">Key *</Label>
            <Input
              id="key"
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              placeholder="e.g., helpdesk"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Unique identifier for the tool (lowercase, no spaces)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the tool"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthly_price">Monthly Price (₹)</Label>
              <Input
                id="monthly_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.monthly_price}
                onChange={(e) => setFormData({ ...formData, monthly_price: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearly_price">Yearly Price (₹)</Label>
              <Input
                id="yearly_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.yearly_price}
                onChange={(e) => setFormData({ ...formData, yearly_price: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="active">Active Status</Label>
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Adding..." : "Add Tool"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
