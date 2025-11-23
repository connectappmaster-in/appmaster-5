import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Tool {
  id: string;
  name: string;
  key: string;
  description: string | null;
  active: boolean;
  monthly_price: number;
  yearly_price: number;
}

interface EditToolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tool: Tool | null;
  onSuccess: () => void;
}

export const EditToolDialog = ({ open, onOpenChange, tool, onSuccess }: EditToolDialogProps) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    key: "",
    description: "",
    active: true,
    monthly_price: 0,
    yearly_price: 0,
  });

  useEffect(() => {
    if (tool) {
      setFormData({
        name: tool.name,
        key: tool.key,
        description: tool.description || "",
        active: tool.active,
        monthly_price: tool.monthly_price || 0,
        yearly_price: tool.yearly_price || 0,
      });
    }
  }, [tool]);

  const handleSave = async () => {
    if (!tool) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("tools")
        .update({
          name: formData.name,
          key: formData.key,
          description: formData.description || null,
          active: formData.active,
          monthly_price: formData.monthly_price,
          yearly_price: formData.yearly_price,
        })
        .eq("id", tool.id);

      if (error) throw error;

      toast.success("Tool updated successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating tool:", error);
      toast.error("Failed to update tool: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Tool</DialogTitle>
          <DialogDescription>
            Update tool details and pricing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tool Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter tool name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="key">Tool Key</Label>
              <Input
                id="key"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                placeholder="Enter tool key"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter tool description"
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
                placeholder="0.00"
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
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
            />
            <Label htmlFor="active" className="cursor-pointer">
              Active
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
