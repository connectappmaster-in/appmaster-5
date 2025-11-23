import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Package, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Tool {
  id: string;
  name: string;
  key: string;
  description: string | null;
  active: boolean;
}

export const OrgToolsManager = () => {
  const { user } = useAuth();
  const [tools, setTools] = useState<Tool[]>([]);
  const [activeTools, setActiveTools] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Get user's organization
      const { data: userData } = await supabase
        .from("users")
        .select("organisation_id")
        .eq("auth_user_id", user.id)
        .single();

      if (!userData) return;

      // Get all available tools
      const { data: toolsData, error: toolsError } = await supabase
        .from("tools")
        .select("*")
        .eq("active", true)
        .order("name");

      if (toolsError) throw toolsError;

      // Get organization's active tools
      const { data: orgData, error: orgError } = await supabase
        .from("organisations")
        .select("active_tools")
        .eq("id", userData.organisation_id)
        .single();

      if (orgError) throw orgError;

      setTools(toolsData || []);
      setActiveTools(orgData?.active_tools || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load tools");
    } finally {
      setLoading(false);
    }
  };

  const toggleTool = async (toolKey: string) => {
    if (!user) return;

    try {
      const { data: userData } = await supabase
        .from("users")
        .select("organisation_id")
        .eq("auth_user_id", user.id)
        .single();

      if (!userData) return;

      const isActive = activeTools.includes(toolKey);
      const newActiveTools = isActive
        ? activeTools.filter(k => k !== toolKey)
        : [...activeTools, toolKey];

      const { error } = await supabase
        .from("organisations")
        .update({ active_tools: newActiveTools })
        .eq("id", userData.organisation_id);

      if (error) throw error;

      setActiveTools(newActiveTools);
      toast.success(isActive ? "Tool deactivated" : "Tool activated");
    } catch (error: any) {
      console.error("Error toggling tool:", error);
      toast.error(error.message || "Failed to update tool");
    }
  };

  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading tools...</div>
      ) : filteredTools.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No tools found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map((tool) => {
            const isActive = activeTools.includes(tool.key);
            return (
              <Card key={tool.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{tool.name}</h3>
                      <Badge variant={isActive ? "default" : "outline"} className="text-xs">
                        {isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  {isActive ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                
                {tool.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {tool.description}
                  </p>
                )}

                <Button
                  variant={isActive ? "outline" : "default"}
                  size="sm"
                  className="w-full"
                  onClick={() => toggleTool(tool.key)}
                >
                  {isActive ? "Deactivate" : "Activate"}
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
