import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Plus, UserCheck, Wrench, Settings, Package, ChevronDown } from "lucide-react";
import { AssetsList } from "@/components/ITAM/AssetsList";
import { CreateAssetDialog } from "@/components/ITAM/CreateAssetDialog";
import { AssetTopBar } from "@/components/ITAM/AssetTopBar";
import { useAssetSetupConfig } from "@/hooks/useAssetSetupConfig";
export default function AllAssets() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [selectedAssetIds, setSelectedAssetIds] = useState<number[]>([]);
  const [bulkActions, setBulkActions] = useState<any>(null);
  const { categories } = useAssetSetupConfig();
  return (
    <div className="min-h-screen bg-background">
      <AssetTopBar />
      
      <div className="px-4 space-y-2">
        {/* Filters and Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              value={filters.search || ''}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
              className="pl-9 h-8"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {selectedAssetIds.length > 0 && bulkActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8">
                    Bulk Actions ({selectedAssetIds.length})
                    <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={bulkActions.handleCheckOut}>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Check Out
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={bulkActions.handleCheckIn}>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Check In
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={bulkActions.handleMaintenance}>
                    <Wrench className="mr-2 h-4 w-4" />
                    Maintenance
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={bulkActions.handleDispose}>
                    <Settings className="mr-2 h-4 w-4" />
                    Dispose
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={bulkActions.handleDelete} className="text-destructive">
                    <Package className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            <Select
              value={filters.status || 'all'}
              onValueChange={value => setFilters({ ...filters, status: value === 'all' ? null : value })}
            >
              <SelectTrigger className="w-[120px] h-8">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in_repair">In Repair</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
                <SelectItem value="disposed">Disposed</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.type || 'all'}
              onValueChange={value => setFilters({ ...filters, type: value === 'all' ? null : value })}
            >
              <SelectTrigger className="w-[120px] h-8">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button size="sm" onClick={() => setCreateDialogOpen(true)} className="gap-1.5 h-8">
              <Plus className="h-3.5 w-3.5" />
              <span className="text-sm">Add Asset</span>
            </Button>
          </div>
        </div>

        {/* Assets List */}
        <AssetsList
          filters={filters}
          onSelectionChange={(selectedIds, actions) => {
            setSelectedAssetIds(selectedIds);
            setBulkActions(actions);
          }}
        />
      </div>

      <CreateAssetDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
}
