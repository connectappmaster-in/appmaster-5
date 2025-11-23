import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Key, Trash2, Eye, EyeOff } from "lucide-react";
export const APIKeysManager = () => {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleTokens, setVisibleTokens] = useState<Set<string>>(new Set());
  useEffect(() => {
    fetchAPIKeys();
  }, []);
  const fetchAPIKeys = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from("saas_api_keys").select("*").order("created_at", {
        ascending: false
      });
      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error("Error fetching API keys:", error);
    } finally {
      setLoading(false);
    }
  };
  const toggleTokenVisibility = (keyId: string) => {
    setVisibleTokens(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };
  const maskToken = (token: string) => {
    return `${token.substring(0, 8)}${"*".repeat(32)}${token.substring(token.length - 8)}`;
  };
  return <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          
          <p className="text-muted-foreground">Manage API access tokens</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Generate Key
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organisation</TableHead>
              <TableHead>Token</TableHead>
              <TableHead>Scopes</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Used</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Loading API keys...
                </TableCell>
              </TableRow> : apiKeys.length === 0 ? <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No API keys found
                </TableCell>
              </TableRow> : apiKeys.map(key => <TableRow key={key.id}>
                  <TableCell className="font-medium">
                    {key.organisation_id?.substring(0, 8)}...
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    <div className="flex items-center gap-2">
                      {visibleTokens.has(key.id) ? key.token : maskToken(key.token)}
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleTokenVisibility(key.id)}>
                        {visibleTokens.has(key.id) ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {key.scopes?.slice(0, 2).map((scope: string) => <Badge key={scope} variant="outline" className="text-xs">
                          {scope}
                        </Badge>)}
                      {key.scopes?.length > 2 && <Badge variant="outline" className="text-xs">
                          +{key.scopes.length - 2}
                        </Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={key.is_active ? "default" : "secondary"}>
                      {key.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : "Never"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {key.expires_at ? new Date(key.expires_at).toLocaleDateString() : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>)}
          </TableBody>
        </Table>
      </div>
    </div>;
};