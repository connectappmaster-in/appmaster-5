import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Plus, Settings } from "lucide-react";
export const FeatureFlagsManager = () => {
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchFlags();
  }, []);
  const fetchFlags = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from("saas_feature_flags").select("*").order("created_at", {
        ascending: false
      });
      if (error) throw error;
      setFlags(data || []);
    } catch (error) {
      console.error("Error fetching flags:", error);
    } finally {
      setLoading(false);
    }
  };
  const toggleFlag = async (flagId: string, enabled: boolean) => {
    try {
      const {
        error
      } = await supabase.from("saas_feature_flags").update({
        is_global_enabled: enabled
      }).eq("id", flagId);
      if (error) throw error;
      fetchFlags();
    } catch (error) {
      console.error("Error toggling flag:", error);
    }
  };
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          
          <p className="text-muted-foreground">Control feature rollouts and experiments</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Flag
        </Button>
      </div>

      {loading ? <div className="text-center py-8 text-muted-foreground">Loading feature flags...</div> : flags.length === 0 ? <Card className="p-8 text-center text-muted-foreground">
          No feature flags configured yet
        </Card> : <div className="space-y-4">
          {flags.map(flag => <Card key={flag.id} className="p-6">
              <div className="flex items-start gap-4">
                <Switch checked={flag.is_global_enabled} onCheckedChange={checked => toggleFlag(flag.id, checked)} />
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{flag.feature_name}</h3>
                      <Badge variant="outline">{flag.feature_key}</Badge>
                      {flag.is_global_enabled ? <Badge className="bg-green-500">Enabled</Badge> : <Badge variant="secondary">Disabled</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {flag.description || "No description provided"}
                    </p>
                  </div>

                  {flag.is_global_enabled && <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium">
                            Rollout Percentage
                          </label>
                          <span className="text-sm text-muted-foreground">
                            {flag.rollout_percentage}%
                          </span>
                        </div>
                        <Slider value={[flag.rollout_percentage || 0]} max={100} step={10} className="w-full" />
                      </div>

                      {flag.enabled_for_plans?.length > 0 && <div>
                          <label className="text-sm font-medium">Enabled for Plans:</label>
                          <div className="flex gap-2 mt-2">
                            {flag.enabled_for_plans.map((plan: string) => <Badge key={plan} variant="secondary">
                                {plan}
                              </Badge>)}
                          </div>
                        </div>}
                    </div>}
                </div>
                <Button variant="ghost" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </Card>)}
        </div>}
    </div>;
};