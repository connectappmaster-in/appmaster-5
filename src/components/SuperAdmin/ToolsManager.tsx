import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EditToolDialog } from "./EditToolDialog";
import { formatINR } from "@/lib/currencyConversion";
interface Tool {
  id: string;
  name: string;
  key: string;
  description: string | null;
  active: boolean;
  monthly_price: number;
  yearly_price: number;
}
export const ToolsManager = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  useEffect(() => {
    fetchTools();
  }, []);
  useEffect(() => {
    const filtered = tools.filter(tool => tool.name.toLowerCase().includes(searchTerm.toLowerCase()) || tool.key.toLowerCase().includes(searchTerm.toLowerCase()) || tool.description && tool.description.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredTools(filtered);
  }, [searchTerm, tools]);
  const fetchTools = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from("tools").select("id, name, key, description, active, monthly_price, yearly_price").order("name");
      if (error) throw error;
      setTools(data || []);
      setFilteredTools(data || []);
    } catch (error: any) {
      console.error("Error fetching tools:", error);
      toast.error("Failed to load tools");
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = (tool: Tool) => {
    setEditingTool(tool);
    setEditDialogOpen(true);
  };
  return <>
      <Card>
        
        <CardContent>
          {loading ? <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading tools...</div>
            </div> : <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tool Name</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Monthly Price</TableHead>
                    <TableHead className="text-right">Yearly Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTools.length === 0 ? <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No tools found
                      </TableCell>
                    </TableRow> : filteredTools.map(tool => <TableRow key={tool.id}>
                        <TableCell className="font-medium">{tool.name}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {tool.key}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {tool.description || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={tool.active ? "default" : "secondary"}>
                            {tool.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatINR(tool.monthly_price || 0)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatINR(tool.yearly_price || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(tool)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>)}
                </TableBody>
              </Table>
            </div>}
        </CardContent>
      </Card>

      <EditToolDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} tool={editingTool} onSuccess={fetchTools} />
    </>;
};