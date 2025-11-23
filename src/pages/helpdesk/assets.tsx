import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AssetsList } from "@/components/ITAM/AssetsList";
import { CreateAssetDialog } from "@/components/ITAM/CreateAssetDialog";
import { AssetAssignmentsList } from "@/components/ITAM/AssetAssignmentsList";

export default function HelpdeskAssets() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="w-full">
      {/* Main Content with Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="all">All Assets</TabsTrigger>
            <TabsTrigger value="assigned">Assigned</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button 
              onClick={() => {
                console.log("=== ADD ASSET CLICKED ===");
                setCreateDialogOpen(true);
              }}
              className="shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Asset
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          <AssetsList />
        </TabsContent>

        <TabsContent value="assigned" className="space-y-4">
          <AssetAssignmentsList />
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          <AssetsList status="active" />
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <AssetsList status="maintenance" />
        </TabsContent>
      </Tabs>

      {/* Dialog */}
      <CreateAssetDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}
