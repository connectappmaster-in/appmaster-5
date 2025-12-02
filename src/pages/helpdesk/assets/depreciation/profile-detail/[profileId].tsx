import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { TrendingDown, Package, Calendar } from "lucide-react";

const ProfileDetail = () => {
  const { profileId } = useParams();
  const navigate = useNavigate();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["depreciation-profile-detail", profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("asset_depreciation_profiles")
        .select("*")
        .eq("id", profileId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!profileId,
  });

  const { data: entries = [] } = useQuery({
    queryKey: ["depreciation-entries", profileId],
    queryFn: async () => {
      const { data } = await supabase
        .from("depreciation_entries")
        .select("*")
        .eq("profile_id", profileId)
        .order("period_end", { ascending: false });
      return data || [];
    },
    enabled: !!profileId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p>Profile not found</p>
      </div>
    );
  }

  const totalDepreciated = entries.reduce((sum, e) => sum + (parseFloat(String(e.depreciation_amount)) || 0), 0);
  const latestEntry = entries[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">Depreciation Profile</h1>
                <Badge variant={profile.is_active ? "default" : "secondary"}>
                  {profile.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Asset ID: {profile.asset_id}
              </p>
            </div>
          </div>
          <Button onClick={() => navigate(`/helpdesk/assets/depreciation/ledger/${profile.asset_id}`)}>
            View Ledger
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cost Basis</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">INR {profile.cost_basis.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Salvage: INR {profile.salvage_value.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Depreciated</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">INR {totalDepreciated.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{entries.length} periods</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Book Value</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                INR {latestEntry ? latestEntry.book_value.toLocaleString() : profile.cost_basis.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Current value</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Method</p>
                <p className="font-medium">Method ID: {profile.method_id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Frequency</p>
                <p className="font-medium capitalize">{profile.frequency}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Useful Life</p>
                <p className="font-medium">{profile.useful_life_years} years ({profile.useful_life_periods} periods)</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium">{format(new Date(profile.depreciation_start_date), "MMM dd, yyyy")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Depreciation Entries ({entries.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Depreciation</TableHead>
                  <TableHead className="text-right">Accumulated</TableHead>
                  <TableHead className="text-right">Book Value</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Posted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No entries yet. Run depreciation to generate entries.
                    </TableCell>
                  </TableRow>
                ) : (
                  entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        {format(new Date(entry.period_start), "MMM yyyy")}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        INR {Number(entry.depreciation_amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        INR {Number(entry.accumulated_depreciation).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        INR {Number(entry.book_value).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={entry.entry_type === "normal" ? "default" : "secondary"}>
                          {entry.entry_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={entry.posted ? "default" : "outline"}>
                          {entry.posted ? "Posted" : "Draft"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileDetail;
