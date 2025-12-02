import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface DetailsTabProps {
  asset: any;
}

export const DetailsTab = ({ asset }: DetailsTabProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          {/* Miscellaneous Section */}
          <div className="col-span-2 mb-2">
            <h3 className="text-sm font-semibold mb-2">Miscellaneous</h3>
          </div>
          <div className="flex justify-between text-sm py-1">
            <span className="text-muted-foreground">Serial No</span>
            <span className="font-medium">{asset.serial_number || '—'}</span>
          </div>
          <div className="flex justify-between text-sm py-1">
            <span className="text-muted-foreground">Purchased from</span>
            <span className="font-medium text-primary hover:underline cursor-pointer">{asset.purchased_from || '—'}</span>
          </div>

          {/* Custom Fields Section */}
          <div className="col-span-2 mt-3 mb-2">
            <h3 className="text-sm font-semibold mb-2">Custom fields</h3>
          </div>
          <div className="flex justify-between text-sm py-1">
            <span className="text-muted-foreground">Asset Configuration</span>
            <span>{asset.asset_configuration || '—'}</span>
          </div>
          <div className="flex justify-between text-sm py-1">
            <span className="text-muted-foreground">Mouse</span>
            <span>—</span>
          </div>
          <div className="flex justify-between text-sm py-1">
            <span className="text-muted-foreground">Asset Classification</span>
            <span>{asset.classification || 'Internal'}</span>
          </div>
          <div className="flex justify-between text-sm py-1">
            <span className="text-muted-foreground">Keyboard</span>
            <span>—</span>
          </div>
          <div className="flex justify-between text-sm py-1">
            <span className="text-muted-foreground" />
            <span />
          </div>
          <div className="flex justify-between text-sm py-1">
            <span className="text-muted-foreground">Headphone</span>
            <span>—</span>
          </div>

          {/* Check-out Section */}
          {asset.assigned_to && (
            <>
              <div className="col-span-2 mt-3 mb-2">
                <h3 className="text-sm font-semibold mb-2">Check out</h3>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span className="text-muted-foreground">Assigned to</span>
                <span className="font-medium text-primary hover:underline cursor-pointer">{asset.assigned_to}</span>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span className="text-muted-foreground">Check-out Notes</span>
                <span>{asset.checkout_notes || '—'}</span>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span className="text-muted-foreground">Check-out Date</span>
                <span>{asset.checkout_date ? format(new Date(asset.checkout_date), "dd/MM/yyyy") : '—'}</span>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span className="text-muted-foreground">Due date</span>
                <span>{asset.due_date ? format(new Date(asset.due_date), "dd/MM/yyyy") : 'No due date'}</span>
              </div>
            </>
          )}

          {/* Creation Section */}
          <div className="col-span-2 mt-3 mb-2">
            <h3 className="text-sm font-semibold mb-2">Creation</h3>
          </div>
          <div className="flex justify-between text-sm py-1">
            <span className="text-muted-foreground">Date Created</span>
            <span>{asset.created_at ? format(new Date(asset.created_at), "dd/MM/yyyy HH:mm a") : '—'}</span>
          </div>
          <div className="flex justify-between text-sm py-1">
            <span className="text-muted-foreground">Created by</span>
            <span className="font-medium text-primary hover:underline cursor-pointer">{asset.created_by || '—'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
