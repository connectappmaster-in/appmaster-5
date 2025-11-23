import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Package } from "lucide-react";
import { CreateServiceRequestDialog } from "./CreateServiceRequestDialog";

export const ServiceCatalog = () => {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);

  const { data: catalogItems, isLoading } = useQuery({
    queryKey: ["srm-catalog"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("srm_catalog")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Group by category
  const groupedItems = catalogItems?.reduce((acc: any, item: any) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  const handleRequestService = (service: any) => {
    setSelectedService(service);
    setRequestDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!catalogItems || catalogItems.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No services available</p>
            <p className="text-sm text-muted-foreground">
              Service catalog is currently empty. Contact your administrator.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {Object.entries(groupedItems || {}).map(([category, items]: [string, any]) => (
          <div key={category}>
            <h2 className="text-2xl font-bold mb-4">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item: any) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        {item.estimated_delivery_days && (
                          <Badge variant="secondary" className="mt-2">
                            {item.estimated_delivery_days} days
                          </Badge>
                        )}
                      </div>
                      {item.icon && <span className="text-2xl">{item.icon}</span>}
                    </div>
                    <CardDescription className="mt-2">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full" 
                      onClick={() => handleRequestService(item)}
                    >
                      Request Service
                    </Button>
                    {item.requires_approval && (
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        Requires approval
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <CreateServiceRequestDialog
        open={requestDialogOpen}
        onOpenChange={setRequestDialogOpen}
        service={selectedService}
      />
    </>
  );
};
