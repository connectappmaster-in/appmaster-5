import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AuditTabProps {
  assetId: number;
}

export const AuditTab = ({ assetId }: AuditTabProps) => {
  // No audit records yet - empty state
  const audits: any[] = [];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <Button variant="outline" size="sm" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Record Audit
          </Button>

          <div className="text-center py-6 text-sm text-muted-foreground">No audit records</div>
        </div>
      </CardContent>
    </Card>
  );
};
