import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { ServiceCatalog } from "@/components/SRM/ServiceCatalog";
import { ServiceRequestList } from "@/components/SRM/ServiceRequestList";
import { CreateAdHocRequestDialog } from "@/components/SRM/CreateAdHocRequestDialog";

export default function ServiceRequests() {
  const [activeTab, setActiveTab] = useState("catalog");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleNewRequest = () => {
    setCreateDialogOpen(true);
  };

  return (
    <div className="max-w-7xl space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="catalog">Service Catalog</TabsTrigger>
            <TabsTrigger value="requests">My Requests</TabsTrigger>
            <TabsTrigger value="changes">Change Management</TabsTrigger>
          </TabsList>
          
          <Button onClick={handleNewRequest} className="flex-shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>

        <TabsContent value="catalog" className="mt-6">
          <ServiceCatalog />
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Request History</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ServiceRequestList myRequests={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="changes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Requests</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage infrastructure and system changes
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-center py-12 text-muted-foreground">
                Change management functionality coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateAdHocRequestDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}