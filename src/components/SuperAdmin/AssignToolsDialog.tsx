import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUserTools } from "@/hooks/useUserTools";
import { useOrganisation } from "@/contexts/OrganisationContext";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AssignToolsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  assignedBy: string;
}

export const AssignToolsDialog = ({ open, onOpenChange, user, assignedBy }: AssignToolsDialogProps) => {
  const { allTools, userTools, isLoading, assignTool, unassignTool } = useUserTools(user?.id);
  const { organisation } = useOrganisation();
  const [selectedToolIds, setSelectedToolIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  // Filter tools to only show those active in the organization
  const organizationActiveTools = allTools.filter((tool: any) => 
    organisation?.active_tools?.includes(tool.key)
  );

  // Initialize selected tools when user tools load
  useEffect(() => {
    if (userTools) {
      const assignedToolIds = new Set(userTools.map((ut: any) => ut.tool_id));
      setSelectedToolIds(assignedToolIds);
    }
  }, [userTools]);

  const handleToggleTool = (toolId: string) => {
    const newSelected = new Set(selectedToolIds);
    if (newSelected.has(toolId)) {
      newSelected.delete(toolId);
    } else {
      newSelected.add(toolId);
    }
    setSelectedToolIds(newSelected);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const currentToolIds = new Set(userTools.map((ut: any) => ut.tool_id));
      
      // Tools to add
      const toolsToAdd = Array.from(selectedToolIds).filter(id => !currentToolIds.has(id));
      
      // Tools to remove
      const toolsToRemove = Array.from(currentToolIds).filter(id => !selectedToolIds.has(id));

      // Execute assignments
      for (const toolId of toolsToAdd) {
        await assignTool.mutateAsync({ userId: user.id, toolId, assignedBy });
      }

      // Execute unassignments
      for (const toolId of toolsToRemove) {
        await unassignTool.mutateAsync({ userId: user.id, toolId });
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error saving tool assignments:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Tools</DialogTitle>
          <DialogDescription>
            Select which tools {user?.name || user?.email} can access
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : organizationActiveTools.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No active tools available. Please activate tools in the Tools Management section first.
            </AlertDescription>
          </Alert>
        ) : (
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-3">
              {organizationActiveTools.map((tool: any) => {
                const isSelected = selectedToolIds.has(tool.id);
                return (
                  <div
                    key={tool.id}
                    className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => handleToggleTool(tool.id)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggleTool(tool.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{tool.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          ₹{tool.price}
                        </Badge>
                      </div>
                      {tool.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {tool.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || isLoading}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
