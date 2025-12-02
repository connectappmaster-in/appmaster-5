import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, MoreHorizontal, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EditAssetDialog } from "./EditAssetDialog";
import { AssignAssetDialog } from "./AssignAssetDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface AssetsListProps {
  status?: string;
  filters?: Record<string, any>;
  onSelectionChange?: (selectedIds: number[], bulkActions: BulkActions) => void;
}

interface BulkActions {
  handleCheckOut: () => void;
  handleCheckIn: () => void;
  handleMaintenance: () => void;
  handleDispose: () => void;
  handleDelete: () => void;
}

const statusColors: Record<string, string> = {
  available: "bg-success/10 text-success border-success/20",
  assigned: "bg-primary/10 text-primary border-primary/20",
  in_repair: "bg-warning/10 text-warning border-warning/20",
  retired: "bg-muted/10 text-muted-foreground border-muted/20",
  lost: "bg-destructive/10 text-destructive border-destructive/20",
  disposed: "bg-destructive/10 text-destructive border-destructive/20",
};

type SortColumn = 'asset_id' | 'brand' | 'model' | 'description' | 'serial_number' | 'category' | 'status' | 'assigned_to';
type SortDirection = 'asc' | 'desc' | null;

export const AssetsList = ({ status, filters = {}, onSelectionChange }: AssetsListProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editAsset, setEditAsset] = useState<any>(null);
  const [assignAsset, setAssignAsset] = useState<any>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [selectedAssets, setSelectedAssets] = useState<number[]>([]);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [deleteAssetId, setDeleteAssetId] = useState<number | null>(null);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />;
    }
    if (sortDirection === 'asc') {
      return <ChevronUp className="ml-1 h-3 w-3" />;
    }
    return <ChevronDown className="ml-1 h-3 w-3" />;
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelection = filteredAssets.map((asset: any) => asset.id);
      setSelectedAssets(newSelection);
      notifyParent(newSelection);
    } else {
      setSelectedAssets([]);
      notifyParent([]);
    }
  };

  const handleSelectAsset = (assetId: number, checked: boolean) => {
    let newSelection: number[];
    if (checked) {
      newSelection = [...selectedAssets, assetId];
    } else {
      newSelection = selectedAssets.filter(id => id !== assetId);
    }
    setSelectedAssets(newSelection);
    notifyParent(newSelection);
  };

  const notifyParent = (selectedIds: number[]) => {
    if (onSelectionChange) {
      onSelectionChange(selectedIds, {
        handleCheckOut: handleBulkCheckOut,
        handleCheckIn: handleBulkCheckIn,
        handleMaintenance: handleBulkMaintenance,
        handleDispose: handleBulkDispose,
        handleDelete: handleBulkDelete,
      });
    }
  };

  const handleBulkCheckOut = async () => {
    toast.success(`Checking out ${selectedAssets.length} asset(s)`);
    setSelectedAssets([]);
  };

  const handleBulkCheckIn = async () => {
    toast.success(`Checking in ${selectedAssets.length} asset(s)`);
    setSelectedAssets([]);
  };

  const handleBulkMaintenance = async () => {
    try {
      const { error } = await supabase
        .from('itam_assets')
        .update({ status: 'in_repair' })
        .in('id', selectedAssets);

      if (error) throw error;
      
      toast.success(`${selectedAssets.length} asset(s) marked for maintenance`);
      setSelectedAssets([]);
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    } catch (error: any) {
      toast.error("Failed to update assets: " + error.message);
    }
  };

  const handleBulkDispose = async () => {
    try {
      const { error } = await supabase
        .from('itam_assets')
        .update({ status: 'disposed' })
        .in('id', selectedAssets);

      if (error) throw error;
      
      toast.success(`${selectedAssets.length} asset(s) marked as disposed`);
      setSelectedAssets([]);
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    } catch (error: any) {
      toast.error("Failed to update assets: " + error.message);
    }
  };

  const handleBulkDelete = async () => {
    setBulkDeleteConfirmOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      const { error } = await supabase
        .from('itam_assets')
        .update({ is_deleted: true })
        .in('id', selectedAssets);

      if (error) throw error;
      
      toast.success(`${selectedAssets.length} asset(s) deleted`);
      setSelectedAssets([]);
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["assets-count"] });
    } catch (error: any) {
      toast.error("Failed to delete assets: " + error.message);
    }
  };

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ["assets", status, filters],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: userData } = await supabase
        .from("users")
        .select("organisation_id")
        .eq("auth_user_id", user.id)
        .single();

      const { data: profileData } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", user.id)
        .maybeSingle();

      const tenantId = profileData?.tenant_id || 1;
      const orgId = userData?.organisation_id;

      let query = supabase.from("itam_assets").select("*").eq("is_deleted", false).order("created_at", { ascending: false });

      if (orgId) {
        query = query.eq("organisation_id", orgId);
      } else {
        query = query.eq("tenant_id", tenantId);
      }

      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Client-side filtering
  let filteredAssets = assets.filter((asset: any) => {
    if (filters.status && asset.status !== filters.status) return false;
    if (filters.type && asset.category !== filters.type) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      const matchesSearch = 
        asset.asset_id?.toLowerCase().includes(search) || 
        asset.brand?.toLowerCase().includes(search) ||
        asset.model?.toLowerCase().includes(search) ||
        asset.serial_number?.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }
    return true;
  });

  // Apply sorting
  if (sortColumn && sortDirection) {
    filteredAssets = [...filteredAssets].sort((a, b) => {
      const aVal = a[sortColumn] || '';
      const bVal = b[sortColumn] || '';
      
      const comparison = aVal.toString().localeCompare(bVal.toString(), undefined, { numeric: true });
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading assets...</p>
        </div>
      </div>
    );
  }

  if (filteredAssets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-lg">
        <div className="rounded-full bg-muted p-4 mb-3">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold mb-1">No assets found</h3>
        <p className="text-xs text-muted-foreground mb-4 text-center max-w-md">
          {Object.keys(filters).length > 0 
            ? "Try adjusting your filters to see more assets" 
            : "Get started by creating your first asset"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedAssets.length === filteredAssets.length && filteredAssets.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="text-xs font-medium h-9">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 -ml-2 hover:bg-muted group"
                  onClick={() => handleSort('asset_id')}
                >
                  ASSET ID
                  {getSortIcon('asset_id')}
                </Button>
              </TableHead>
              <TableHead className="text-xs font-medium h-9">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 -ml-2 hover:bg-muted group"
                  onClick={() => handleSort('brand')}
                >
                  MAKE
                  {getSortIcon('brand')}
                </Button>
              </TableHead>
              <TableHead className="text-xs font-medium h-9">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 -ml-2 hover:bg-muted group"
                  onClick={() => handleSort('model')}
                >
                  MODEL
                  {getSortIcon('model')}
                </Button>
              </TableHead>
              <TableHead className="text-xs font-medium h-9">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 -ml-2 hover:bg-muted group"
                  onClick={() => handleSort('description')}
                >
                  DESCRIPTION
                  {getSortIcon('description')}
                </Button>
              </TableHead>
              <TableHead className="text-xs font-medium h-9">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 -ml-2 hover:bg-muted group"
                  onClick={() => handleSort('serial_number')}
                >
                  SERIAL NO
                  {getSortIcon('serial_number')}
                </Button>
              </TableHead>
              <TableHead className="text-xs font-medium h-9">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 -ml-2 hover:bg-muted group"
                  onClick={() => handleSort('category')}
                >
                  CATEGORY
                  {getSortIcon('category')}
                </Button>
              </TableHead>
              <TableHead className="text-xs font-medium h-9">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 -ml-2 hover:bg-muted group"
                  onClick={() => handleSort('status')}
                >
                  STATUS
                  {getSortIcon('status')}
                </Button>
              </TableHead>
              <TableHead className="text-xs font-medium h-9">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 -ml-2 hover:bg-muted group"
                  onClick={() => handleSort('assigned_to')}
                >
                  ASSIGNED TO
                  {getSortIcon('assigned_to')}
                </Button>
              </TableHead>
              <TableHead className="text-xs font-medium h-9 text-right">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
          {filteredAssets.map((asset: any) => (
              <TableRow 
                key={asset.id} 
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell className="py-2" onClick={(e) => e.stopPropagation()}>
                  <Checkbox 
                    checked={selectedAssets.includes(asset.id)}
                    onCheckedChange={(checked) => handleSelectAsset(asset.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell className="py-2" onClick={() => navigate(`/helpdesk/assets/detail/${asset.id}`)}>
                  <div className="font-medium text-sm">{asset.asset_id || '—'}</div>
                </TableCell>
                <TableCell className="py-2 text-sm" onClick={() => navigate(`/helpdesk/assets/detail/${asset.id}`)}>
                  {asset.brand || '—'}
                </TableCell>
                <TableCell className="py-2 text-sm" onClick={() => navigate(`/helpdesk/assets/detail/${asset.id}`)}>
                  {asset.model || '—'}
                </TableCell>
                <TableCell className="py-2 text-sm text-muted-foreground max-w-[200px] truncate" onClick={() => navigate(`/helpdesk/assets/detail/${asset.id}`)}>
                  {asset.description || '—'}
                </TableCell>
                <TableCell className="py-2 text-sm" onClick={() => navigate(`/helpdesk/assets/detail/${asset.id}`)}>
                  {asset.serial_number || '—'}
                </TableCell>
                <TableCell className="py-2" onClick={() => navigate(`/helpdesk/assets/detail/${asset.id}`)}>
                  {asset.category && (
                    <Badge variant="outline" className="text-xs capitalize">
                      {asset.category}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="py-2" onClick={() => navigate(`/helpdesk/assets/detail/${asset.id}`)}>
                  <Badge 
                    variant="outline" 
                    className={`text-xs capitalize ${statusColors[asset.status || "available"]}`}
                  >
                    {asset.status || 'available'}
                  </Badge>
                </TableCell>
                <TableCell className="py-2 text-sm" onClick={() => navigate(`/helpdesk/assets/detail/${asset.id}`)}>
                  {asset.assigned_to || '—'}
                </TableCell>
                <TableCell className="text-right py-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/helpdesk/assets/detail/${asset.id}`);
                      }}>
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        setEditAsset(asset);
                      }}>
                        Edit
                      </DropdownMenuItem>
                      {asset.status === 'available' && (
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          setAssignAsset(asset);
                        }}>
                          Check Out
                        </DropdownMenuItem>
                      )}
                      {asset.status === 'assigned' && (
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          setAssignAsset(asset);
                        }}>
                          Check In
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const { error } = await supabase
                            .from('itam_assets')
                            .update({ status: 'lost' })
                            .eq('id', asset.id);
                          if (error) throw error;
                          toast.success('Asset marked as lost');
                          queryClient.invalidateQueries({ queryKey: ["assets"] });
                        } catch (error: any) {
                          toast.error("Failed to update asset: " + error.message);
                        }
                      }}>
                        Lost
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const { error } = await supabase
                            .from('itam_assets')
                            .update({ status: 'in_repair' })
                            .eq('id', asset.id);
                          if (error) throw error;
                          toast.success('Asset marked for repair');
                          queryClient.invalidateQueries({ queryKey: ["assets"] });
                        } catch (error: any) {
                          toast.error("Failed to update asset: " + error.message);
                        }
                      }}>
                        Repair
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const { error } = await supabase
                            .from('itam_assets')
                            .update({ status: 'retired' })
                            .eq('id', asset.id);
                          if (error) throw error;
                          toast.success('Asset marked as broken');
                          queryClient.invalidateQueries({ queryKey: ["assets"] });
                        } catch (error: any) {
                          toast.error("Failed to update asset: " + error.message);
                        }
                      }}>
                        Broken
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const { error } = await supabase
                            .from('itam_assets')
                            .update({ status: 'disposed' })
                            .eq('id', asset.id);
                          if (error) throw error;
                          toast.success('Asset disposed');
                          queryClient.invalidateQueries({ queryKey: ["assets"] });
                        } catch (error: any) {
                          toast.error("Failed to update asset: " + error.message);
                        }
                      }}>
                        Dispose
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        toast.info('Replicate feature coming soon');
                      }}>
                        Replicate
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={async (e) => {
                        e.stopPropagation();
                        setDeleteAssetId(asset.id);
                      }}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editAsset && (
        <EditAssetDialog
          asset={editAsset}
          open={!!editAsset}
          onOpenChange={(open) => !open && setEditAsset(null)}
        />
      )}
      
      {assignAsset && (
        <AssignAssetDialog
          asset={assignAsset}
          open={!!assignAsset}
          onOpenChange={(open) => !open && setAssignAsset(null)}
        />
      )}

      <ConfirmDialog
        open={bulkDeleteConfirmOpen}
        onOpenChange={setBulkDeleteConfirmOpen}
        onConfirm={() => {
          confirmBulkDelete();
          setBulkDeleteConfirmOpen(false);
        }}
        title="Delete Assets"
        description={`Are you sure you want to delete ${selectedAssets.length} asset(s)? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
      />

      <ConfirmDialog
        open={deleteAssetId !== null}
        onOpenChange={(open) => !open && setDeleteAssetId(null)}
        onConfirm={async () => {
          if (deleteAssetId === null) return;
          try {
            const { error } = await supabase
              .from('itam_assets')
              .update({ is_deleted: true })
              .eq('id', deleteAssetId);
            if (error) throw error;
            toast.success('Asset deleted');
            queryClient.invalidateQueries({ queryKey: ["assets"] });
            queryClient.invalidateQueries({ queryKey: ["assets-count"] });
          } catch (error: any) {
            toast.error("Failed to delete asset: " + error.message);
          }
          setDeleteAssetId(null);
        }}
        title="Delete Asset"
        description="Are you sure you want to delete this asset? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />
    </>
  );
};
