import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link2, Plus } from "lucide-react";

interface LinkingTabProps {
  assetId: number;
}

export const LinkingTab = ({ assetId }: LinkingTabProps) => {
  const { data: linkedAssets, isLoading } = useQuery({
    queryKey: ["asset-links", assetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("asset_linked_items")
        .select(`
          *,
          linked_asset:itam_assets!asset_linked_items_linked_asset_id_fkey(id, name, asset_id, category)
        `)
        .eq("asset_id", assetId);

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div className="text-center py-6 text-sm text-muted-foreground">Loading linked assets...</div>;
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <Button variant="outline" size="sm" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Link Asset
          </Button>

          {(!linkedAssets || linkedAssets.length === 0) ? (
            <div className="text-center py-6 text-sm text-muted-foreground">No linked assets</div>
          ) : (
            <div className="space-y-2">
              {linkedAssets.map((link: any) => (
                <div key={link.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{link.linked_asset?.name || 'Unknown Asset'}</p>
                      <p className="text-xs text-muted-foreground">
                        {link.linked_asset?.asset_id} • {link.link_type || 'Related'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
