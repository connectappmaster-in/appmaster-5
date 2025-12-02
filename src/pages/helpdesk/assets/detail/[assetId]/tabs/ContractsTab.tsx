import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Calendar, AlertTriangle } from "lucide-react";
import { format, differenceInDays } from "date-fns";

interface ContractsTabProps {
  assetId: number;
}

export const ContractsTab = ({ assetId }: ContractsTabProps) => {
  const { data: contracts, isLoading } = useQuery({
    queryKey: ["asset-contracts", assetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("asset_contracts")
        .select("*")
        .eq("asset_id", assetId)
        .order("contract_start", { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const getContractStatus = (endDate: string | null) => {
    if (!endDate) return { label: "Active", variant: "default" as const };
    const days = differenceInDays(new Date(endDate), new Date());
    if (days < 0) return { label: "Expired", variant: "destructive" as const };
    if (days <= 30) return { label: `${days} days left`, variant: "secondary" as const };
    return { label: "Active", variant: "default" as const };
  };

  if (isLoading) {
    return <div className="text-center py-6 text-sm text-muted-foreground">Loading contracts...</div>;
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <Button variant="outline" size="sm" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Contract
          </Button>

          {(!contracts || contracts.length === 0) ? (
            <div className="text-center py-6 text-sm text-muted-foreground">No contracts</div>
          ) : (
            <div className="space-y-2">
              {contracts.map((contract) => {
                const status = getContractStatus(contract.contract_end);
                return (
                  <div key={contract.id} className="p-2 border rounded">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">{contract.contract_type || 'Contract'}</p>
                      </div>
                      <Badge variant={status.variant} className="text-xs">
                        {status.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground ml-6">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {contract.contract_start ? format(new Date(contract.contract_start), "dd/MM/yyyy") : 'N/A'}
                        {" - "}
                        {contract.contract_end ? format(new Date(contract.contract_end), "dd/MM/yyyy") : 'N/A'}
                      </div>
                      {contract.cost && <span>₹{contract.cost.toLocaleString()}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
