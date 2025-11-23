import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Loader2, Clock, User, AlertTriangle } from "lucide-react";

const statusColors: Record<string, string> = {
  draft: "bg-gray-500",
  submitted: "bg-yellow-500",
  approved: "bg-blue-500",
  scheduled: "bg-purple-500",
  in_progress: "bg-orange-500",
  completed: "bg-green-500",
  failed: "bg-red-500",
};

export default function ChangeDetail() {
  const { changeId } = useParams();

  const { data: change, isLoading } = useQuery({
    queryKey: ["change-request", changeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("change_requests")
        .select("*")
        .eq("id", changeId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!changeId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!change) {
    return (
      <div className="min-h-screen bg-background">
        <BackButton />
        <div className="container mx-auto py-8 px-4 text-center">
          <p className="text-muted-foreground">Change request not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <BackButton />
      <div className="container mx-auto py-4 px-4 max-w-7xl">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{change.change_number}</h1>
            <Badge className={statusColors[change.status]}>{change.status}</Badge>
            <Badge variant="outline">{change.risk} Risk</Badge>
          </div>
          <p className="text-xl font-medium">{change.title}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="details" className="w-full">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="implementation">Implementation</TabsTrigger>
                <TabsTrigger value="backout">Backout Plan</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-sm">{change.description}</p>
                    </div>

                    {change.impact && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Impact Assessment
                        </h4>
                        <p className="text-sm">{change.impact}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="implementation" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Implementation Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-sm">
                      {change.implementation_plan || "No implementation plan provided"}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="backout" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Backout Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-sm">
                      {change.backout_plan || "No backout plan provided"}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Change Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {change.change_calendar_date && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Scheduled</p>
                      <p className="font-medium">
                        {format(new Date(change.change_calendar_date), "MMM d, yyyy HH:mm")}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-medium">
                      {format(new Date(change.created_at), "MMM d, yyyy HH:mm")}
                    </p>
                  </div>
                </div>
                {change.linked_request_id && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Linked Request</p>
                      <p className="font-medium">#{change.linked_request_id}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
