import { useState } from "react";
import { BackButton } from "@/components/BackButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceCatalog } from "@/components/SRM/ServiceCatalog";
import { ServiceRequestList } from "@/components/SRM/ServiceRequestList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package, Clock, CheckCircle2, XCircle } from "lucide-react";

const SRM = () => {
  const { data: stats } = useQuery({
    queryKey: ["srm-stats"],
    queryFn: async () => {
      const { data: requests } = await supabase
        .from("srm_requests")
        .select("status");

      const pending = requests?.filter(r => r.status === "pending").length || 0;
      const inProgress = requests?.filter(r => r.status === "in_progress").length || 0;
      const completed = requests?.filter(r => r.status === "completed").length || 0;
      const rejected = requests?.filter(r => r.status === "rejected").length || 0;

      return { pending, inProgress, completed, rejected, total: requests?.length || 0 };
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <BackButton />
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Service Request Management</h1>
          <p className="text-muted-foreground">Browse services and manage your requests</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pending || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.inProgress || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.completed || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.rejected || 0}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="catalog" className="w-full">
          <TabsList>
            <TabsTrigger value="catalog">Service Catalog</TabsTrigger>
            <TabsTrigger value="my-requests">My Requests</TabsTrigger>
            <TabsTrigger value="all-requests">All Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="catalog" className="mt-6">
            <ServiceCatalog />
          </TabsContent>

          <TabsContent value="my-requests" className="mt-6">
            <ServiceRequestList myRequests={true} />
          </TabsContent>

          <TabsContent value="all-requests" className="mt-6">
            <ServiceRequestList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SRM;
