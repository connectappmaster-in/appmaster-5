import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle } from "lucide-react";

interface ServiceCatalogCardProps {
  item: any;
  onRequest: () => void;
}

export function ServiceCatalogCard({ item, onRequest }: ServiceCatalogCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{item.name}</CardTitle>
          {item.auto_approval && (
            <Badge variant="secondary" className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Auto-Approve
            </Badge>
          )}
        </div>
        <CardDescription className="line-clamp-2">{item.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          {item.sla_id && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>SLA Applied</span>
            </div>
          )}
          <Button onClick={onRequest} size="sm">
            Request Service
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
