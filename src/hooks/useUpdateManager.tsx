import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { startOfMonth } from "date-fns";

export interface UpdateDevice {
  id: string;
  tenant_id: number;
  organisation_id: string | null;
  asset_id: number;
  asset_tag: string | null;
  device_name: string;
  device_type: "laptop" | "desktop" | "server";
  os_name: string | null;
  os_version: string | null;
  owner_id: string | null;
  owner_name: string | null;
  location: string | null;
  department: string | null;
  last_synced_at: string | null;
  last_update_check: string | null;
  update_status: "unknown" | "up_to_date" | "pending" | "installing" | "reboot_required" | "failed";
  pending_updates_count: number;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  is_completed_this_month?: boolean;
}

export interface UpdateCompletion {
  id: string;
  device_id: string;
  completion_month: string;
  completed_by: string;
  completed_at: string;
  notes: string | null;
  is_manual: boolean;
}

export interface RolloutJob {
  id: string;
  name: string;
  description: string | null;
  status: "draft" | "scheduled" | "running" | "paused" | "completed" | "failed" | "cancelled";
  job_type: "standard" | "staged" | "emergency";
  target_type: "all" | "selected" | "group" | "department" | "location";
  target_filter: Record<string, unknown>;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  maintenance_window_start: string | null;
  maintenance_window_end: string | null;
  auto_reboot: boolean;
  max_retries: number;
  rollback_on_failure: boolean;
  requires_approval: boolean;
  approved_by: string | null;
  approved_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateAlert {
  id: string;
  device_id: string | null;
  job_id: string | null;
  alert_type: "failure" | "reboot_required" | "overdue" | "job_completed" | "critical_update";
  severity: "info" | "warning" | "error" | "critical";
  title: string;
  message: string | null;
  is_read: boolean;
  ticket_id: number | null;
  created_at: string;
}

export const useUpdateDevices = () => {
  return useQuery({
    queryKey: ["update-devices"],
    queryFn: async () => {
      const currentMonth = startOfMonth(new Date()).toISOString().split('T')[0];
      
      const { data: devices, error } = await supabase
        .from("update_devices")
        .select("*")
        .eq("is_active", true)
        .order("device_name");

      if (error) throw error;

      // Get completions for current month
      const { data: completions } = await supabase
        .from("update_completions")
        .select("device_id")
        .eq("completion_month", currentMonth);

      const completedDeviceIds = new Set(completions?.map(c => c.device_id) || []);

      return (devices || []).map(d => ({
        ...d,
        is_completed_this_month: completedDeviceIds.has(d.id)
      })) as UpdateDevice[];
    },
  });
};

export const useUpdateStats = () => {
  return useQuery({
    queryKey: ["update-stats"],
    queryFn: async () => {
      const currentMonth = startOfMonth(new Date()).toISOString().split('T')[0];

      const { data: devices } = await supabase
        .from("update_devices")
        .select("id, update_status")
        .eq("is_active", true);

      const { data: completions } = await supabase
        .from("update_completions")
        .select("device_id")
        .eq("completion_month", currentMonth);

      const { data: jobs } = await supabase
        .from("update_rollout_jobs")
        .select("id, status")
        .in("status", ["scheduled", "running"]);

      const { data: alerts } = await supabase
        .from("update_alerts")
        .select("id")
        .eq("is_read", false);

      const completedIds = new Set(completions?.map(c => c.device_id) || []);
      const totalDevices = devices?.length || 0;
      const compliantDevices = (devices || []).filter(d => 
        d.update_status === "up_to_date" || completedIds.has(d.id)
      ).length;

      return {
        totalDevices,
        compliantDevices,
        complianceRate: totalDevices > 0 ? Math.round((compliantDevices / totalDevices) * 100) : 0,
        pendingUpdates: devices?.filter(d => d.update_status === "pending").length || 0,
        failedUpdates: devices?.filter(d => d.update_status === "failed").length || 0,
        rebootRequired: devices?.filter(d => d.update_status === "reboot_required").length || 0,
        activeJobs: jobs?.length || 0,
        unreadAlerts: alerts?.length || 0,
        manualCompletions: completions?.length || 0,
      };
    },
  });
};

export const useRolloutJobs = () => {
  return useQuery({
    queryKey: ["rollout-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("update_rollout_jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as RolloutJob[];
    },
  });
};

export const useUpdateAlerts = () => {
  return useQuery({
    queryKey: ["update-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("update_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as UpdateAlert[];
    },
  });
};

export const useSyncAssets = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

      const { data: userData } = await supabase
        .from("users")
        .select("organisation_id")
        .eq("auth_user_id", user.id)
        .single();

      const tenantId = profile?.tenant_id || 1;
      const orgId = userData?.organisation_id;

      // Fetch assets that are laptops, desktops, or servers
      const { data: assets, error: assetsError } = await supabase
        .from("itam_assets")
        .select(`
          id,
          asset_tag,
          name,
          type,
          category,
          model,
          serial_number,
          status,
          assigned_to,
          location,
          department
        `)
        .eq("status", "deployed")
        .eq("tenant_id", tenantId);

      if (assetsError) throw assetsError;

      // Get existing synced devices
      const { data: existingDevices } = await supabase
        .from("update_devices")
        .select("asset_id")
        .eq("tenant_id", tenantId);

      const existingAssetIds = new Set(existingDevices?.map(d => d.asset_id) || []);

      // Filter to device types and new assets
      const deviceAssets = (assets || []).filter(a => {
        const categoryName = (a.category || a.type || "").toLowerCase();
        return ["laptop", "desktop", "server", "workstation", "computer"].some(t => categoryName.includes(t));
      });

      const newAssets = deviceAssets.filter(a => !existingAssetIds.has(a.id));

      if (newAssets.length === 0) {
        return { synced: 0, total: deviceAssets.length };
      }

      // Get assigned user names
      const assignedUserIds = newAssets.map(a => a.assigned_to).filter(Boolean) as string[];
      const { data: users } = assignedUserIds.length > 0 
        ? await supabase.from("users").select("id, name").in("id", assignedUserIds)
        : { data: [] };

      const userMap = new Map((users || []).map(u => [u.id, u.name]));

      // Insert new devices
      const devicesToInsert = newAssets.map(asset => {
        const categoryName = (asset.category || asset.type || "").toLowerCase();
        let deviceType: "laptop" | "desktop" | "server" = "desktop";
        if (categoryName.includes("laptop")) deviceType = "laptop";
        else if (categoryName.includes("server")) deviceType = "server";

        return {
          tenant_id: tenantId,
          organisation_id: orgId,
          asset_id: asset.id,
          asset_tag: asset.asset_tag,
          device_name: asset.name,
          device_type: deviceType,
          owner_id: asset.assigned_to,
          owner_name: asset.assigned_to ? userMap.get(asset.assigned_to) || null : null,
          location: asset.location || null,
          department: asset.department || null,
          update_status: "unknown" as const,
        };
      });

      const { error: insertError } = await supabase
        .from("update_devices")
        .insert(devicesToInsert);

      if (insertError) throw insertError;

      return { synced: newAssets.length, total: deviceAssets.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["update-devices"] });
      queryClient.invalidateQueries({ queryKey: ["update-stats"] });
      toast.success(`Synced ${data.synced} new device(s) from ${data.total} total assets`);
    },
    onError: (error) => {
      toast.error("Failed to sync assets: " + error.message);
    },
  });
};

export const useMarkUpdateCompleted = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ deviceId, notes }: { deviceId: string; notes?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

      const { data: userData } = await supabase
        .from("users")
        .select("organisation_id")
        .eq("auth_user_id", user.id)
        .single();

      const currentMonth = startOfMonth(new Date()).toISOString().split('T')[0];

      // Check if already completed
      const { data: existing } = await supabase
        .from("update_completions")
        .select("id")
        .eq("device_id", deviceId)
        .eq("completion_month", currentMonth)
        .maybeSingle();

      if (existing) {
        throw new Error("Device already marked as completed for this month");
      }

      const { error } = await supabase
        .from("update_completions")
        .insert({
          tenant_id: profile?.tenant_id || 1,
          organisation_id: userData?.organisation_id,
          device_id: deviceId,
          completion_month: currentMonth,
          completed_by: user.id,
          notes,
          is_manual: true,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["update-devices"] });
      queryClient.invalidateQueries({ queryKey: ["update-stats"] });
      toast.success("Device marked as updated for this month");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useCreateRolloutJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (job: Partial<RolloutJob>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

      const { data: userData } = await supabase
        .from("users")
        .select("organisation_id")
        .eq("auth_user_id", user.id)
        .single();

      const insertData = {
        tenant_id: profile?.tenant_id || 1,
        organisation_id: userData?.organisation_id,
        name: job.name!,
        description: job.description,
        job_type: job.job_type || "standard",
        target_type: job.target_type || "all",
        target_filter: job.target_filter || {},
        scheduled_at: job.scheduled_at,
        maintenance_window_start: job.maintenance_window_start,
        maintenance_window_end: job.maintenance_window_end,
        auto_reboot: job.auto_reboot || false,
        max_retries: job.max_retries || 3,
        rollback_on_failure: job.rollback_on_failure || false,
        requires_approval: job.requires_approval || false,
        created_by: user.id,
        status: job.scheduled_at ? "scheduled" : "draft",
      };

      const { data, error } = await supabase
        .from("update_rollout_jobs")
        .insert(insertData as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rollout-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["update-stats"] });
      toast.success("Rollout job created");
    },
    onError: (error) => {
      toast.error("Failed to create job: " + error.message);
    },
  });
};

export const useUpdateJobStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, status }: { jobId: string; status: RolloutJob["status"] }) => {
      const updateData: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
      
      if (status === "running") {
        updateData.started_at = new Date().toISOString();
      } else if (["completed", "failed", "cancelled"].includes(status)) {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("update_rollout_jobs")
        .update(updateData)
        .eq("id", jobId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rollout-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["update-stats"] });
      toast.success("Job status updated");
    },
    onError: (error) => {
      toast.error("Failed to update job: " + error.message);
    },
  });
};
